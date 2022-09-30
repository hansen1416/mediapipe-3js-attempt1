// import { EventEmitter } from "events";
// import * as net from "net";
// import * as tls from "tls";

const { EventEmitter } = require("events");
const net = require("net");
const tls = require("tls");

// import { RedisCommandArguments } from '../commands';
// import { ConnectionTimeoutError, ClientClosedError, SocketClosedUnexpectedlyError, ReconnectStrategyError } from '../errors';
// import { promiseTimeout } from '../utils';

// export interface RedisSocketCommonOptions {
//     connectTimeout?: number;
//     noDelay?: boolean;
//     keepAlive?: number | false;
//     reconnectStrategy?(retries: number): number | Error;
// }

// type RedisNetSocketOptions = Partial<net.SocketConnectOpts> & {
//     tls?: false;
// };

// export interface RedisTlsSocketOptions extends tls.ConnectionOptions {
//     tls: true;
// }

// export type RedisSocketOptions = RedisSocketCommonOptions & (RedisNetSocketOptions | RedisTlsSocketOptions);

// interface CreateSocketReturn<T> {
//     connectEvent: string;
//     socket: T;
// }

// export type RedisSocketInitiator = () => Promise<void>;

function promiseTimeout(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

class RedisSocket extends EventEmitter {
	static #initiateOptions(options) {
		options ??= {};
		if (!options.path) {
			options.port = 6379;
			options.host = "localhost";
		}

		options.connectTimeout ??= 5000;
		options.keepAlive ??= 5000;
		options.noDelay ??= true;

		return options;
	}

	static #isTlsSocket(options) {
		return options.tls === true;
	}

	// #initiator;

	#options;

	#socket;

	#isOpen = false;

	get isOpen() {
		return this.#isOpen;
	}

	#isReady = false;

	get isReady() {
		return this.#isReady;
	}

	// `writable.writableNeedDrain` was added in v15.2.0 and therefore can't be used
	// https://nodejs.org/api/stream.html#stream_writable_writableneeddrain
	#writableNeedDrain = false;

	get writableNeedDrain() {
		return this.#writableNeedDrain;
	}

	#isSocketUnrefed = false;

	constructor(initiator, options) {
		super();

		// this.#initiator = initiator;
		this.#options = RedisSocket.#initiateOptions(options);
	}

	reconnectStrategy(retries) {
		if (this.#options.reconnectStrategy) {
			try {
				const retryIn = this.#options.reconnectStrategy(retries);
				if (
					typeof retryIn !== "number" &&
					!(retryIn instanceof Error)
				) {
					throw new TypeError(
						"Reconnect strategy should return `number | Error`"
					);
				}

				return retryIn;
			} catch (err) {
				this.emit("error", err);
			}
		}

		return Math.min(retries * 50, 500);
	}

	async connect() {
		if (this.#isOpen) {
			throw new Error("Socket already opened");
		}

		return this.#connect(0);
	}

	async #connect(retries, hadError) {
		if (retries > 0 || hadError) {
			this.emit("reconnecting");
		}

		try {
			this.#isOpen = true;
			this.#socket = await this.#createSocket();
			this.#writableNeedDrain = false;
			this.emit("connect");

			try {
				// await this.#initiator();
			} catch (err) {
				this.#socket.destroy();
				this.#socket = undefined;
				throw err;
			}
			this.#isReady = true;
			this.emit("ready");
		} catch (err) {
			const retryIn = this.reconnectStrategy(retries);
			if (retryIn instanceof Error) {
				this.#isOpen = false;
				this.emit("error", err);
				throw new ReconnectStrategyError(retryIn, err);
			}

			this.emit("error", err);
			await promiseTimeout(retryIn);
			return this.#connect(retries + 1);
		}
	}

	#createSocket() {
		return new Promise((resolve, reject) => {
			const { connectEvent, socket } = RedisSocket.#isTlsSocket(
				this.#options
			)
				? this.#createTlsSocket()
				: this.#createNetSocket();

			if (this.#options.connectTimeout) {
				socket.setTimeout(this.#options.connectTimeout, () =>
					socket.destroy(new ConnectionTimeoutError())
				);
			}

			if (this.#isSocketUnrefed) {
				socket.unref();
			}

			socket
				.setNoDelay(this.#options.noDelay)
				.once("error", reject)
				.once(connectEvent, () => {
					socket
						.setTimeout(0)
						// https://github.com/nodejs/node/issues/31663
						.setKeepAlive(
							this.#options.keepAlive !== false,
							this.#options.keepAlive || 0
						)
						.off("error", reject)
						.once("error", (err) => this.#onSocketError(err))
						.once("close", (hadError) => {
							if (
								!hadError &&
								this.#isOpen &&
								this.#socket === socket
							) {
								this.#onSocketError(
									new SocketClosedUnexpectedlyError()
								);
							}
						})
						.on("drain", () => {
							this.#writableNeedDrain = false;
							this.emit("drain");
						})
						.on("data", (data) => this.emit("data", data));

					resolve(socket);
				});
		});
	}

	#createNetSocket() {
		return {
			connectEvent: "connect",
			socket: net.connect(this.#options), // TODO
		};
	}

	#createTlsSocket() {
		return {
			connectEvent: "secureConnect",
			socket: tls.connect(this.#options), // TODO
		};
	}

	#onSocketError(err) {
		this.#isReady = false;
		this.emit("error", err);

		this.#connect(0, true).catch(() => {
			// the error was already emitted, silently ignore it
		});
	}

	writeCommand(args) {
		if (!this.#socket) {
			throw new ClientClosedError();
		}

		for (const toWrite of args) {
			this.#writableNeedDrain = !this.#socket.write(toWrite);
		}
	}

	disconnect() {
		if (!this.#socket) {
			throw new ClientClosedError();
		} else {
			this.#isOpen = this.#isReady = false;
		}

		this.#socket.destroy();
		this.#socket = undefined;
		this.emit("end");
	}

	async quit(fn) {
		if (!this.#isOpen) {
			throw new ClientClosedError();
		}

		this.#isOpen = false;
		await fn();
		this.disconnect();
	}

	#isCorked = false;

	cork() {
		if (!this.#socket || this.#isCorked) {
			return;
		}

		this.#socket.cork();
		this.#isCorked = true;

		queueMicrotask(() => {
			this.#socket?.uncork();
			this.#isCorked = false;
		});
	}

	ref() {
		this.#isSocketUnrefed = false;
		this.#socket?.ref();
	}

	unref() {
		this.#isSocketUnrefed = true;
		this.#socket?.unref();
	}
}

exports.RedisSocket = RedisSocket;
