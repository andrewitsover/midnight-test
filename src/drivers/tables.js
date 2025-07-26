import { Table } from 'flyweightjs';

export class WeightClasses extends Table {
  id = this.Intp;
  name = this.Text;
  weightLbs = this.Int;
  gender = this.Check(this.Text, ['m', 'f']);
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
  startTime = this.Index(this.Date);
  locationId = this.Cascade(Locations, {
    index: false,
    null: true
  });
}

export class Cards extends Table {
  id = this.Intp;
  eventId = this.Cascade(Events);
  cardName = this.Text;
  cardOrder = this.Int;
  startTime = this.Datex;
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
  isActive = this.Index(this.Bool);
  phone = this.Jsonx;
  documents = this.Jsonx;
  
  displayName = this.Concat(this.name, ' (', this.nickname, ')');
  heightInches = this.Round(this.Divide(this.heightCm, 2.54));
  instagram = this.Extract(this.social, '$.instagram');
}

export class OtherNames extends Table {
  id = this.Intp;
  fighterId = this.Cascade(Fighters);
  name = this.Text;
}

export class FighterCoaches extends Table {
  id = this.Intp;
  coachId = this.Cascade(Coaches, { index: false });
  fighterId = this.Cascade(Fighters, { index: false });
  startDate = this.Text;
  endDate = this.Textx;

  Attributes = () => {
    this.Unique(this.fighterId, this.coachId);
  }
}

export class Rankings extends Table {
  id = this.Intp;
  fighterId = this.Int;
  weightClassId = this.Int;
  rank = this.Index(this.Int, rank => {
    return {
      [rank]: 0
    }
  });
  isInterim = this.Bool;
}

export class Methods extends Table {
  id = this.Intp;
  name = this.Text;
  abbreviation = this.Text;
}

export class Fights extends Table {
  id = this.Intp;
  cardId = this.Cascade(Cards);
  fightOrder = this.Int;
  blueId = this.Cascade(Fighters);
  redId = this.Cascade(Fighters);
  winnerId = this.Cascade(Fighters, {
    index: false,
    null: true
  });
  methodId = this.Cascade(Methods, { index: false });
  methodDescription = this.Textx;
  endRound = this.Intx;
  endSeconds = this.Intx;
  titleFight = this.Bool;
  isInterim = this.Bool;
  weightClassId = this.Cascade(WeightClasses, { index: false });
  oddsBlue = this.Intx;
  oddsRed = this.Intx;
  catchweightLbs = this.Intx;
}

export class CancelledFights extends Table {
  id = this.Intp;
  cardId = this.Index(this.Int);
  cardOrder = this.Int;
  blueId = this.Int;
  redId = this.Int;
  cancelledAt = this.Date;
  cancellationReason = this.Text;
}

export class TitleRemovals extends Table {
  id = this.Intp;
  fighterId = this.Cascade(FighterCoaches, { column: 'fighterId' });
  weightClassId = this.Cascade(WeightClasses, { index: false });
  isInterim = this.Bool;
  removedAt = this.Date;
  reason = this.Text;
}

const fighter = new Fighters();

export class FighterProfiles extends Table {
  name = fighter.name;
  hometown = fighter.hometown;
  
  Virtual = fighter;
}
