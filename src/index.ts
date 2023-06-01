import { testTemplate, TestTemplateParams } from './templates/v1'
import { API } from './api'

class Client<T> {
    private state: { url?: string; params?: Record<string, any> } = {}
    constructor(
        private readonly template: (params: T) => Record<string, any>,
        private readonly apiClient
    ) {}

    init(templateParams: T) {
        this.state.params = this.template(templateParams)
        console.log('Client init', templateParams)
        return this
    }

    query(target: string) {
        this.state.url = `/_application/${target}/search`

        return this
    }

    customQuery(url: string) {
        this.state.url = url

        return this
    }

    search() {
        console.log('Client search')

        return this.apiClient.post(this.state.url, this.state.params)
    }
}

const client = new Client<TestTemplateParams>(
    testTemplate,
    new API(
        'R2EtbmQ0Z0JLMmoxdEptbFRjLUw6T1ZIS3c5RTdTV0dMRm1lOU5rYVBNQQ==',
        'http://localhost:9300'
    )
)
export default client.init.bind(client)
