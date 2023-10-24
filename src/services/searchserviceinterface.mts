export interface SearchItem {
    id: number;
    link: string;
    name: string;
    nname: string;
    dob?: string;
    country?: string;
    address?: string;
    description: string;
    thumbnail?: string;
}

export interface SearchServiceInterface {
    search(name: string): Promise<SearchItem[] | null>;
}
