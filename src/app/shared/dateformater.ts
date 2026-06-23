export class Dateformater {

    toModel(data: any): string {
        if (data == null) {
            return data;
        }
        // let date: string =(data.day < 10 ? ("0" + data.day) : data.day)  + "-" + (data.month < 10 ? ("0" + data.month) : data.month) + "-" +data.year ;

        let date: string =(data.year  + "-" + (data.month < 10 ? ("0" + data.month) : data.month) + "-" + (data.day < 10 ? ("0" + data.day) : data.day) ) ;
        return date;
    }

      toModelDisplay(data: any): string {
        if (data == null) {
            return data;
        }
        // let date: string =(data.day < 10 ? ("0" + data.day) : data.day)  + "-" + (data.month < 10 ? ("0" + data.month) : data.month) + "-" +data.year ;

        let date: string =
  (data.day < 10 ? '0' + data.day : data.day) + '/' +
  (data.month < 10 ? '0' + data.month : data.month) + '/' +
  data.year;
        return date;
    }
    fromModel(data: any): any {
        if (data == null) {
          return data;
        }
      
        let date;
        if (typeof data === "string") {
          const dateParts: string[] = data.split('-');
          date = { month: +dateParts[0], day: +dateParts[1], year: +dateParts[2] };
        } else {
          date = { month: data.month, day: data.day, year: data.year };
        }
      
        return date;
      }
      
    fromModel1(data: any): any {
      if (data == null) {
          return data;
      }
      let date;
      if (typeof (data) === "string") {
          // let separators: string[] = ["/", "\\s", "T"];
          let dateParts: string[] = data.split('-');
          // new RegExp(separators.join('-'), 'g'
         
          date = { year: +dateParts[0], month: +dateParts[1],  day: +dateParts[2]};
      }
      else {
          date = { year: data.year, month: data.month,   day: data.day};
      }
      return date;
  }
      fromModelError(data: any): any {
        if (data == null) {
          return data;
        }
      
        let date;
        if (typeof data === "string") {
          const dateParts: string[] = data.split('-');
          date = { month: +dateParts[2], day: +dateParts[1], year: +dateParts[0] };
        } else {
          date = { month: data.month, day: data.day, year: data.year };
        }
      
        return date;
      }
    getDateTimeFromModel(data: string): Date {
        if (data == null) {
            return data;
        }
        var new_date = data.split('/');
        var swap_element = new_date[0];
        new_date[0] = new_date[1];
        new_date[1] = swap_element;

        var new_date1 = new_date[0] + '/' + new_date[1] + '/' + new_date[2];
        //return date format >> Mon Jan 07 2019 06:10:00 GMT+0500 (Pakistan Standard Time)
        var dateTime = new Date(new_date1);
        return dateTime;
    }
    selectThisMonth() {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const d = new Date();
        // document.write("The current month is " + monthNames[d.getMonth()]);
        // let date = month;
        //let day = new Date(year, month, 0).getDate();
        //this.toDate = {year: year, month: month, day: day};
        return monthNames[d.getMonth()];
    }
}