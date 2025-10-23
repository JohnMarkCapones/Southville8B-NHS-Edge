import { ImageType } from '../dto/create-location.dto';
export declare class Location {
    id: string;
    name: string;
    description?: string;
    image_type: ImageType;
    image_url?: string;
    preview_image_url?: string;
    created_at: string;
    hotspots?: Array<{
        id: string;
        label: string;
        x_position: number;
        y_position: number;
        link_to_location_id?: string;
        created_at: string;
    }>;
}
