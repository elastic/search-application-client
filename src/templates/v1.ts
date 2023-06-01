export interface TestTemplateParams {
    facets: Record<string, { size: number }>
    search_fields: string[]
    result_fields
}

export const testTemplate = (params: TestTemplateParams) => {
    return {}
}
