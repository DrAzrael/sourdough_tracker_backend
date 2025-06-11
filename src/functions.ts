
import * as dotenv from "dotenv";
import { Village, VillageStat, VillageStatAssigned, VillageStatType } from "./item.model";
dotenv.config();


export function getLatestStatsByType(stats: VillageStat[]): VillageStat[] {
  const latestStatsMap = new Map<string, VillageStat>();

  stats.forEach(stat => {
    const currentDate = stat.report_date_time; // Already a Date object
    const statTypeIdString = stat.stat_type_id.toString(); // Convert ObjectId to string for Map key
    
    const existingStat = latestStatsMap.get(statTypeIdString);

    if (!existingStat || existingStat.report_date_time < currentDate) {
      latestStatsMap.set(statTypeIdString, stat);
    }
  });

  return Array.from(latestStatsMap.values());
}

export function assignStatTypes(villageStats: VillageStat[], statTypes: VillageStatType[]): VillageStatAssigned[] {
    const statTypeMap = new Map<string, string>();
    statTypes.forEach(statType => {
        statTypeMap.set(statType._id.toString(), statType.data_type);
    });

    return villageStats.map(stat => {
      const statType = statTypeMap.get(stat.stat_type_id.toString()) || "undefined";
        
        return {
            _id: stat._id,
            stat_type: statType,
            village_id: stat.village_id,
            reporter_id: stat.reporter_id,
            report_date_time: stat.report_date_time,
            value: stat.value
        };
    });
}