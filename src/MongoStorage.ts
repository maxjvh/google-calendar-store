import * as moment from 'moment';

import {MongoClient} from 'mongodb';
import {EventStorage} from './EventStorage';
import CalendarEvent from './CalendarEvent';

export default class MongoStorage implements EventStorage {
  db: any;
  collection: any;

  async init(url: string = process.env.MONGO_URL) {
    this.db = await MongoClient.connect(url);
    this.collection = this.db.collection('events');
  }

  create(event: CalendarEvent) {
    return this.collection.insertOne(event.data);
  }

  update(eventId: string, event: CalendarEvent) {
    return this.collection.updateOne(
      {googleId: eventId},
      event.data
    );
  }

  findOne(eventId) {
    return this.collection.findOne({googleId: eventId});
  }

  async find(start, end, calendarId) {
    const items = await this.collection.find({
      calendarGoogleId: calendarId,
      cancelled: false,
      start: {$gte: start},
      end: end ? {$lte: end} : undefined
    }, {
      sort: [['start', 'asc']]
    }).toArray();
    return items.map(i => new CalendarEvent(i));
  }
}