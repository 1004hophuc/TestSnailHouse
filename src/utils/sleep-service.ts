import { Injectable } from '@nestjs/common';
@Injectable()
export class UtilitiesService {
  getDateDetail = (numDate: number, gmt = 1) => {
    const newTime = 1000 * 60 * 60 * gmt + Number(numDate); // Change to GMT + 7
    const newDateString = new Date(newTime);
    const month = newDateString.getMonth() + 1;
    const year = newDateString.getFullYear();
    const date = newDateString.getDate();
    return {
      month,
      year,
      date,
    };
  };
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
