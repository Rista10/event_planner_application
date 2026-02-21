export interface Tag {
    id: string;
    name: string;
    created_at: Date;
}   

export interface CreateTagBody {
    name: string;
}