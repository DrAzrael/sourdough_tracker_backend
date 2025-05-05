export interface Village {
    x: number;
    y: number;
    image: string;
    name: string;
    slogan: string;
    mayor: string;
    confirmed: boolean;
}

export interface Info {
    x: number;
    y: number;
    type_id: number;
    value: number;
    edit_date: Date;
    confirmed: boolean;
}