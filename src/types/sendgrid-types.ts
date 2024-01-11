export interface Template {
    name: string;
    id: string;
    versions: TemplateVersion[];
}

export interface TemplateVersion {
    id: string;
    template_id: string;
    active: boolean;
    name: string;
    html_content: string;
    plain_content: string;
    subject: string;
}

export interface RetrieveTemplatesResponse {
    result: Template[];
    error?: string;
}
