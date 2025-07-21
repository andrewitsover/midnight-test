import { Table } from 'flyweightjs';

export class WeightClasses extends Table {
  id = this.Intp;
  name = this.Text;
  weightLbs = this.Int;
  gender = this.Text;

  Attributes = {
    [this.gender]: ['m', 'f']
  }
}

export class Locations extends Table {
  id = this.Intp;
  name = this.Text;
  address = this.Text;
  lat = this.Real;
  long = this.Real;
}

export class Events extends Table {
  id = this.Intp;
  name = this.Text;
  startTime = this.Date;
  locationId = this.Intx;

  Attributes = {
    [this.locationId]: Locations.OnDeleteCascade,
    [this.Index]: this.startTime
  }
}

export class Cards extends Table {
  id = this.Intp;
  eventId = this.Int;
  cardName = this.Text;
  cardOrder = this.Int;
  startTime = this.Datex;

  Attributes = {
    [this.eventId]: Events.OnDeleteCascade,
    [this.Index]: this.eventId
  }
}

export class Coaches extends Table {
  id = this.Intp;
  name = this.Text;
  city = this.Text;
  profile = this.Jsonx;
}

export class Fighters extends Table {
  id = this.Intp;
  name = this.Text;
  nickname = this.Text;
  born = this.Textx;
  heightCm = this.Intx;
  reachCm = this.Intx;
  hometown = this.Text;
  social = this.Jsonx;
  isActive = this.Bool;
  phone = this.Jsonx;
  documents = this.Jsonx;
  
  displayName = this.Concat(this.name, ' (', this.nickname, ')');
  heightInches = this.Round(this.Divide(this.heightCm, 2.54));

  Attributes = {
    [this.Index]: this.isActive
  }
}

export class OtherNames extends Table {
  id = this.Intp;
  fighterId = this.Int;
  name = this.Text;

  Attributes = {
    [this.fighterId]: Fighters.OnDeleteCascade
  }
}

export class FighterCoaches extends Table {
  id = this.Intp;
  coachId =  this.Int;
  fighterId = this.Int;
  startDate = this.Text;
  endDate = this.Textx;

  Attributes = {
    [this.Unique]: [this.fighterId, this.coachId],
    [this.coachId]: Coaches.OnDeleteCascade,
    [this.fighterId]: Fighters.OnDeleteCascade
  }
}

export class Rankings extends Table {
  id = this.Intp;
  fighterId = this.Int;
  weightClassId = this.Int;
  rank = this.Int;
  isInterim = this.Bool;

  Attributes = {
    [this.Index]: { [this.rank]: 0 }
  }
}

export class Methods extends Table {
  id = this.Intp;
  name = this.Text;
  abbreviation = this.Text;
}

export class Fights extends Table {
  id = this.Intp;
  cardId = this.Int;
  fightOrder = this.Int;
  blueId = this.Int;
  redId = this.Int;
  winnerId = this.Intx;
  methodId = this.Intx;
  methodDescription = this.Textx;
  endRound = this.Intx;
  endSeconds = this.Intx;
  titleFight = this.Bool;
  isInterim = this.Bool;
  weightClassId = this.Intx;
  oddsBlue = this.Intx;
  oddsRed = this.Intx;
  catchweightLbs = this.Intx;

  Attributes = {
    [this.cardId]: Cards.OnDeleteCascade,
    [this.blueId]: Fighters.OnDeleteCascade,
    [this.redId]: Fighters.OnDeleteCascade,
    [this.winnerId]: Fighters.OnDeleteCascade,
    [this.methodId]: Methods.OnDeleteCascade,
    [this.weightClassId]: WeightClasses.OnDeleteCascade,
    [this.Index]: this.cardId,
    [this.Index]: this.blueId,
    [this.Index]: this.redId
  }
}

export class CancelledFights extends Table {
  id = this.Intp;
  cardId = this.Int;
  cardOrder = this.Int;
  blueId = this.Int;
  redId = this.Int;
  cancelledAt = this.Date;
  cancellationReason = this.Text;

  Attributes = {
    [this.Index]: this.cardId
  }
}

export class TitleRemovals extends Table {
  id = this.Intp;
  fighterId = this.Int;
  weightClassId = this.Int;
  isInterim = this.Bool;
  removedAt = this.Date;
  reason = this.Text;

  Attributes = {
    [this.Index]: this.fighterId,
    [this.fighterId]: FighterCoaches.OnDeleteCascade,
    [this.weightClassId]: WeightClasses.OnDeleteCascade
  }
}

export class FighterProfiles extends Fighters {
  Virtual = {
    rowId: this.id,
    name: this.name,
    hometown: this.hometown
  };
}

