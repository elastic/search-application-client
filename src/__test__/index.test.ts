import SearchApplicationClient from '../index'

describe('SearchApplicationClient', () => {
    test('should throw error on missing application name', () => {
        expect(() => SearchApplicationClient("", "", "")).toThrow(Error("applicationName is required"));
    })

    test('should throw error on missing endpoint', () => {
        expect(() => SearchApplicationClient("application name", "", "")).toThrow(Error("endpoint is required"));
    })

    test('should throw error on missing apiKey', () => {
        expect(() => SearchApplicationClient("application name", "endpoint", "")).toThrow(Error("apiKey is required"));
    })

    test('should not throw error on missing params', () => {
        expect(() => SearchApplicationClient("application name", "endpoint", "api key")).not.toThrow();
    })
})
