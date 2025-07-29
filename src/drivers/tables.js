import { Table } from 'flyweightjs';

export class WeightClasses extends Table {
  id = this.IntPrimary;
  name = this.Text;
  weightLbs = this.Int;
  gender = this.Check(this.Text, ['m', 'f']);
}

export class Locations extends Table {
  id = this.IntPrimary;
  name = this.Text;
  address = this.Text;
  lat = this.Real;
  long = this.Real;
}

export class Events extends Table {
  id = this.IntPrimary;
  name = this.Text;
  startTime = this.Index(this.Date);
  locationId = this.Cascade(Locations, {
    index: false,
    null: true
  });
}

export class Cards extends Table {
  id = this.IntPrimary;
  eventId = this.Cascade(Events);
  cardName = this.Text;
  cardOrder = this.Int;
  startTime = this.Null(this.Date);
}

export class Coaches extends Table {
  id = this.IntPrimary;
  name = this.Text;
  city = this.Text;
  profile = this.Null(this.Json);
}

export class Fighters extends Table {
  id = this.IntPrimary;
  name = this.Text;
  nickname = this.Text;
  born = this.Null(this.Text);
  heightCm = this.Null(this.Int);
  reachCm = this.Null(this.Int);
  hometown = this.Text;
  social = this.Null(this.Json);
  isActive = this.Index(this.Bool);
  phone = this.Null(this.Json);
  documents = this.Null(this.Json);
  
  displayName = this.Concat(this.name, ' (', this.nickname, ')');
  heightInches = this.Round(this.Divide(this.heightCm, 2.54));
  instagram = this.Extract(this.social, '$.instagram');
}

export class OtherNames extends Table {
  id = this.IntPrimary;
  fighterId = this.Cascade(Fighters);
  name = this.Text;
}

export class FighterCoaches extends Table {
  id = this.IntPrimary;
  coachId = this.Cascade(Coaches, { index: false });
  fighterId = this.Cascade(Fighters, { index: false });
  startDate = this.Text;
  endDate = this.Null(this.Text);

  Attributes = () => {
    this.Unique(this.fighterId, this.coachId);
  }
}

export class Rankings extends Table {
  id = this.IntPrimary;
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
  id = this.IntPrimary;
  name = this.Text;
  abbreviation = this.Text;
}

export class Fights extends Table {
  id = this.IntPrimary;
  cardId = this.Cascade(Cards);
  fightOrder = this.Int;
  blueId = this.Cascade(Fighters);
  redId = this.Cascade(Fighters);
  winnerId = this.Cascade(Fighters, {
    index: false,
    null: true
  });
  methodId = this.Cascade(Methods, { index: false });
  methodDescription = this.Null(this.Text);
  endRound = this.Null(this.Int);
  endSeconds = this.Null(this.Int);
  titleFight = this.Bool;
  isInterim = this.Bool;
  weightClassId = this.Cascade(WeightClasses, { index: false });
  oddsBlue = this.Null(this.Int);
  oddsRed = this.Null(this.Int);
  catchweightLbs = this.Null(this.Int);
}

export class CancelledFights extends Table {
  id = this.IntPrimary;
  cardId = this.Index(this.Int);
  cardOrder = this.Int;
  blueId = this.Int;
  redId = this.Int;
  cancelledAt = this.Date;
  cancellationReason = this.Text;
}

export class TitleRemovals extends Table {
  id = this.IntPrimary;
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
