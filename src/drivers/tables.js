import { 
  Table,
  FTSTable,
  ExternalFTSTable,
  Unicode61,
  text,
  int,
  check,
  real,
  index,
  nil,
  concat,
  round,
  divide,
  extract,
  bool,
  cascade,
  zonedDateTime,
  instant,
  plainDate,
  attributes,
  unique,
  tokenizer
} from '@andrewitsover/midnight';

export class WeightClasses extends Table {
  name = text;
  weightLbs = int;
  gender = check(text, { in: ['m', 'f'] });
}

export class Locations extends Table {
  name = text;
  address = text;
  lat = real;
  long = real;
}

export class Events extends Table {
  name = text;
  startTime = index(zonedDateTime);
  locationId = nil.cascade(Locations, { index: false });
}

export class Cards extends Table {
  eventId = cascade(Events);
  cardName = text;
  cardOrder = int;
  startTime = nil.zonedDateTime;
}

export class Coaches extends Table {
  name = text;
  city = text;
  profile = nil.json;
}

export class Fighters extends Table {
  name = text;
  nickname = text;
  born = nil.text;
  heightCm = nil.int;
  reachCm = nil.int;
  hometown = text;
  social = nil.json;
  isActive = index(bool);
  phone = nil.json;
  documents = nil.json;

  displayName = () => concat(this.name, ' (', this.nickname, ')');
  heightInches = () => round(divide(this.heightCm, 2.54));
  instagram = () => extract(this.social, '$.instagram');
}

export class OtherNames extends Table {
  fighterId = cascade(Fighters);
  name = text;
}

export class FighterCoaches extends Table {
  coachId = cascade(Coaches, { index: false });
  fighterId = cascade(Fighters, { index: false });
  startDate = plainDate;
  endDate = nil.plainDate;

  [attributes] = () => unique(this.fighterId, this.coachId);
}

export class Rankings extends Table {
  fighterId = int;
  weightClassId = int;
  rank = index(int, rank => ({
    where: {
      [rank]: 0
    }
  }));
  isInterim = bool;
}

export class Methods extends Table {
  name = text;
  abbreviation = text;
}

export class Fights extends Table {
  cardId = cascade(Cards);
  fightOrder = int;
  blueId = cascade(Fighters);
  redId = cascade(Fighters);
  winnerId = nil.cascade(Fighters, { index: false });
  methodId = cascade(Methods, { index: false });
  methodDescription = nil.text;
  endRound = nil.int;
  endSeconds = nil.int;
  titleFight = bool;
  isInterim = bool;
  weightClassId = cascade(WeightClasses, { index: false });
  oddsBlue = nil.int;
  oddsRed = nil.int;
  catchweightLbs = nil.int;
}

export class CancelledFights extends Table {
  cardId = index(int);
  cardOrder = int;
  blueId = int;
  redId = int;
  cancelledAt = instant;
  cancellationReason = text;
}

export class TitleRemovals extends Table {
  fighterId = cascade(FighterCoaches, { column: 'fighterId' });
  weightClassId = cascade(WeightClasses, { index: false });
  isInterim = bool;
  removedAt = instant;
  reason = text;
}

const fighter = new Fighters();

export class FighterProfiles extends ExternalFTSTable {
  name = fighter.name;
  hometown = fighter.hometown;
}

const unicode = new Unicode61({
  removeDiacritics: true,
  porter: true
});

export class Emails extends FTSTable {
  from = text;
  to = text;
  body = text;

  [tokenizer] = unicode;
}
