import { DateTime } from "luxon";

export function formatDateLengthBetween(startAt: Date, endAt: Date) { 
    const diffObj = DateTime.fromJSDate(endAt).diff(DateTime.fromJSDate(startAt), ["days", "hours", "minutes"]).toObject();
    let resultingString = "";
    if(diffObj.days && diffObj.days > 1) { 
        resultingString += `${diffObj.days} days, `;
    }
    if(diffObj.days && diffObj.days === 1) { 
        resultingString += `${diffObj.days} day, `;
    }

    if(diffObj.hours && diffObj.hours > 1) { 
        resultingString += `${diffObj.hours} hours, `;
    }
    if(diffObj.hours && diffObj.hours === 1) { 
        resultingString += `${diffObj.hours} hour, `;
    }

    if(diffObj.minutes && diffObj.minutes > 1) { 
        resultingString += `${Math.round(diffObj.minutes)} minutes, `;
    }
    if(diffObj.minutes && diffObj.minutes === 1) { 
        resultingString += `${diffObj.minutes} minute, `;
    }

    return resultingString;
}


export function getDatesBetween(startDate: Date, endDate: Date): Date[] {
    const currentDate = new Date(startDate.getTime());
    const dates = [];
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }