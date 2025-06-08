import { ObjectId, WithId } from 'mongodb';

// export interface Village {
//     x: number;
//     y: number;
//     image: string;
//     name: string;
//     slogan: string;
//     mayor: string;
//     confirmed: boolean;
// }

// export interface Info {
//     x: number;
//     y: number;
//     type_id: number;
//     value: number;
//     edit_date: Date;
//     confirmed: boolean;
// }

export interface UserSchema {
  _id: ObjectId;
  login: string;
  pass: string;
  roblox_username: string;
  user_state: string;
}

export interface UserState {
    _id: ObjectId;
    state_name: string;
    clearance_level: number;
}

export type User = WithId<Document> & UserSchema;




// export interface RegisterRequest {
//     username: string;
//     login: string;
//     password: string;
// }

// export interface LoginRequest {
//     login: string;
//     password: string;
// }

// export interface VillageStatsRequest {
//     village_id: string;
// }

// export interface VillageStatHistoryRequest {
//     village_id: string;
//     stat_type_id: string;
// }


// export interface VIllageRequest {
//     x: number;
//     y: number;
// }




export interface VillageStat {
    _id: ObjectId;
    stat_type_id: ObjectId;
    village_id: ObjectId;  // This must be ObjectId to match your query
    reporter_id: ObjectId;
    report_date_time: Date;
    value: string;
}

export interface VillageStatType {
    _id: ObjectId;
    data_type: string;
}

export interface VillageStatAssigned {
    _id: ObjectId;
    stat_type: string;
    village_id: ObjectId;
    reporter_id: ObjectId;
    report_date_time: Date;
    value: string;
}

export interface Village {
    _id: ObjectId;
    mayor: string;
    name: string;
    x: number;
    y: number;
    editor_id: ObjectId;
    edit_datetime: Date;
}




export interface JwtPayload {
    login: string;
    // Add other fields if needed (e.g., userId, role)
}