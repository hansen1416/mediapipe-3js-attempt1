from pytube import YouTube


def downloader(url):

    YouTube(url).streams.filter(progressive=True,
                                file_extension='mp4').order_by('resolution').desc().first().download()


if __name__ == "__main__":

    import argparse

    parser = argparse.ArgumentParser(
        prog='Download video from Youtube',
        description='',
        epilog='end===================')

    parser.add_argument('url', type=str, help="Youtube video url")

    args = parser.parse_args()

    downloader(args.url)
