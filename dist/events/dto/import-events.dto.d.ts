declare class ImportEventItemDto {
    title: string;
    description?: string;
    event_date: string;
}
export declare class ImportEventsDto {
    events: ImportEventItemDto[];
    replaceExisting: boolean;
}
export {};
