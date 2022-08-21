module.exports = {
    testEnvironment: "jsdom",
    roots: [
        "<rootDir>/src"
    ],
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.{js,jsx,ts,tsx}",
        "!src/**/*.d.ts"
    ],
    testMatch: [
        "<rootDir>/src/**/*.test.js"
    ],
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
        "^.+\\.(css|less)$": "<rootDir>/config/jest/cssTransform.js",
        ".+\\.(css|styl|less|sass|scss|png|svg|jpg|gif|PNG|ttf|woff|woff2)$": "jest-transform-stub"
    },
    transformIgnorePatterns: [
        "^.+\\.module\\.(css|sass|scss|less)$",
        "/node_modules/(?!antd|@ant-design|rc-.+?|@babel/runtime).+(js|jsx|ts|tsx)$"
    ],
    setupFiles: ["<rootDir>/enzyme.setup.js"]

}