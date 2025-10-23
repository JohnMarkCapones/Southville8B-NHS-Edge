export declare class Hotspot {
    id: string;
    location_id: string;
    label: string;
    x_position: number;
    y_position: number;
    link_to_location_id?: string;
    created_at: string;
    location?: {
        id: string;
        name: string;
        image_type: string;
        preview_image_url?: string;
    };
    linked_location?: {
        id: string;
        name: string;
        image_type: string;
        preview_image_url?: string;
    };
}
