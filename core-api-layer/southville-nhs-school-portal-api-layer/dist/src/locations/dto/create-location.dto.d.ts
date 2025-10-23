export declare enum ImageType {
    PANORAMIC = "panoramic",
    REGULAR = "regular"
}
export declare class CreateLocationDto {
    name: string;
    description?: string;
    imageType: ImageType;
    imageUrl?: string;
    previewImageUrl?: string;
}
