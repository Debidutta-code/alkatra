export type Props = {
    searchParams: {
        token: string;
    };
};

export type RatePlan = {
    _id: string;
    title: string;
    adultPrice: number;
    childrenPrice: number;
    breakfastPrice: number;
    lunchPrice: number;
    dinnerPrice: number;
    customTitle?: string;
    price_category?: string;
    room_base_price: string;
    CP?: string;
    MAP?: string;
    AP?: string;
    EP?: string;
};

export type EditedRatePlan = {
    _id?: string;
    title?: string;
    adultPrice: number;
    childrenPrice: number;
    breakfastPrice: number;
    lunchPrice: number;
    dinnerPrice: number;
    customTitle?: string;
    price_category?: string;
    room_base_price: string;
    CP?: string;
    MAP?: string;
    AP?: string;
    EP?: string;
};

export interface PropertyData {
    _id: string;
    property_name: string;
    property_email: string;
    property_contact: string;
    description:string;
}
export interface EditedProperty {
    property_name: string;
    property_email: string;
    property_contact: string;
    description: string;
}
export interface PropertyDetailsProps {
    property: { data: PropertyData };
    editedProperty: EditedProperty;
    editMode?: boolean;
    accessToken: string;
    propertyId: string | null;
    setProperty: any;
    handleInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSaveClick?: () => void;
    handleEditClick?: () => void;
}

export interface RoomType {
    _id: string;
    propertyInfo_id: string;
    room_name: string;
    room_type: string;
    total_room: number;
    floor: number;
    room_view: string;
    room_size: number;
    room_unit: string;
    smoking_policy: string;
    max_occupancy: number;
    max_number_of_adults: number;
    max_number_of_children: number;
    number_of_bedrooms: number;
    number_of_living_room: number;
    extra_bed: number;
    description: string;
    image: string[];
    available: boolean;
}

export interface RatePlanType {
    _id: string;
    property_id: string,
    applicable_room_name: string,
    meal_plan: string,
    room_price: number,
    rate_plan_name: string,
    rate_plan_description: string,
    min_length_stay: number,    
    max_length_stay: number,   
    min_book_advance: number,   
    max_book_advance: number    
}