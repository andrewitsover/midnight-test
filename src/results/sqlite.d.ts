interface WeightClass {
  id: number;
  name: string;
  weightLbs: number;
  gender: string;
}

interface InsertWeightClass {
  id?: number;
  name: string;
  weightLbs: number;
  gender: string;
}

interface Location {
  id: number;
  name: string;
  address: string;
  lat: number;
  long: number;
}

interface InsertLocation {
  id?: number;
  name: string;
  address: string;
  lat: number;
  long: number;
}

interface LocationById {
  id: number;
  name: string;
  address: string;
  lat: number;
  long: number;
}

interface LocationByMethod {
  id: number;
  name: string;
  count: number;
}

interface LocationDetailedEvents {
  name: string;
  events: Json;
}

interface LocationDistanceFrom {
  id: number;
  name: string;
  address: string;
  lat: number;
  long: number;
  distanceKm: number | null;
}

interface LocationEvents {
  name: string;
  events: Json;
}

interface LocationWinners {
  location: string;
  fighter: string;
  wins: number;
}

interface LocationByIdParams {
  id: any;
}

interface LocationByMethodParams {
  id: any;
}

interface LocationDistanceFromParams {
  lat: any;
  long: any;
}

interface LocationQueries {
  byId<U extends Includes<TypedDb, LocationById>>(query: ComplexSqlQueryIncludeParams<LocationByIdParams, ToWhere<LocationById>, LocationById, U>): Promise<Array<MergeIncludes<LocationById, U>>>;
  byId<K extends keyof LocationById, U extends Includes<TypedDb, LocationById>>(query: ComplexSqlQueryObjectIncludeParams<LocationByIdParams, ToWhere<LocationById>, K, LocationById, U>): Promise<Array<MergeIncludes<Pick<LocationById, K>, U>>>;
  byMethod<U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryIncludeParams<LocationByMethodParams, ToWhere<LocationByMethod>, LocationByMethod, U>): Promise<Array<MergeIncludes<LocationByMethod, U>>>;
  byMethod<K extends keyof LocationByMethod, U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryObjectIncludeParams<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, U>): Promise<Array<MergeIncludes<Pick<LocationByMethod, K>, U>>>;
  detailedEvents<U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryInclude<ToWhere<LocationDetailedEvents>, LocationDetailedEvents, U>): Promise<Array<MergeIncludes<LocationDetailedEvents, U>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryObjectInclude<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, U>): Promise<Array<MergeIncludes<Pick<LocationDetailedEvents, K>, U>>>;
  distanceFrom<U extends Includes<TypedDb, LocationDistanceFrom>>(query: ComplexSqlQueryIncludeParams<LocationDistanceFromParams, ToWhere<LocationDistanceFrom>, LocationDistanceFrom, U>): Promise<Array<MergeIncludes<LocationDistanceFrom, U>>>;
  distanceFrom<K extends keyof LocationDistanceFrom, U extends Includes<TypedDb, LocationDistanceFrom>>(query: ComplexSqlQueryObjectIncludeParams<LocationDistanceFromParams, ToWhere<LocationDistanceFrom>, K, LocationDistanceFrom, U>): Promise<Array<MergeIncludes<Pick<LocationDistanceFrom, K>, U>>>;
  events<U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryInclude<ToWhere<LocationEvents>, LocationEvents, U>): Promise<Array<MergeIncludes<LocationEvents, U>>>;
  events<K extends keyof LocationEvents, U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryObjectInclude<ToWhere<LocationEvents>, K, LocationEvents, U>): Promise<Array<MergeIncludes<Pick<LocationEvents, K>, U>>>;
  winners<U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryInclude<ToWhere<LocationWinners>, LocationWinners, U>): Promise<Array<MergeIncludes<LocationWinners, U>>>;
  winners<K extends keyof LocationWinners, U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryObjectInclude<ToWhere<LocationWinners>, K, LocationWinners, U>): Promise<Array<MergeIncludes<Pick<LocationWinners, K>, U>>>;
}

interface Event {
  id: number;
  name: string;
  startTime: Date;
  locationId: number | null;
}

interface InsertEvent {
  id?: number;
  name: string;
  startTime: Date;
  locationId?: number;
}

interface EventAwayFrom {
  id: number;
  name: string;
  startTime: Date;
  locationId: number | null;
  diff: string | null;
}

interface EventFrom {
  test: number | null;
}

interface EventLag {
  test1: number | string | Buffer | null;
  test2: number | string | Buffer | null;
  test3: number | string | Buffer | null;
}

interface EventOperator {
  result: number;
}

interface EventSpaces {
  id: number;
  name: string;
  test: Json;
}

interface EventTest {
  id: number;
  nest: Json;
}

interface EventAwayFromParams {
  date: any;
}

interface EventQueries {
  awayFrom<U extends Includes<TypedDb, EventAwayFrom>>(query: ComplexSqlQueryIncludeParams<EventAwayFromParams, ToWhere<EventAwayFrom>, EventAwayFrom, U>): Promise<Array<MergeIncludes<EventAwayFrom, U>>>;
  awayFrom<K extends keyof EventAwayFrom, U extends Includes<TypedDb, EventAwayFrom>>(query: ComplexSqlQueryObjectIncludeParams<EventAwayFromParams, ToWhere<EventAwayFrom>, K, EventAwayFrom, U>): Promise<Array<MergeIncludes<Pick<EventAwayFrom, K>, U>>>;
  from<U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryInclude<ToWhere<EventFrom>, EventFrom, U>): Promise<Array<MergeIncludes<EventFrom, U>>>;
  from<K extends keyof EventFrom, U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventFrom>, K, EventFrom, U>): Promise<Array<MergeIncludes<Pick<EventFrom, K>, U>>>;
  lag<U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryInclude<ToWhere<EventLag>, EventLag, U>): Promise<Array<MergeIncludes<EventLag, U>>>;
  lag<K extends keyof EventLag, U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventLag>, K, EventLag, U>): Promise<Array<MergeIncludes<Pick<EventLag, K>, U>>>;
  operator<U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryInclude<ToWhere<EventOperator>, EventOperator, U>): Promise<Array<MergeIncludes<EventOperator, U>>>;
  operator<K extends keyof EventOperator, U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventOperator>, K, EventOperator, U>): Promise<Array<MergeIncludes<Pick<EventOperator, K>, U>>>;
  spaces<U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryInclude<ToWhere<EventSpaces>, EventSpaces, U>): Promise<Array<MergeIncludes<EventSpaces, U>>>;
  spaces<K extends keyof EventSpaces, U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventSpaces>, K, EventSpaces, U>): Promise<Array<MergeIncludes<Pick<EventSpaces, K>, U>>>;
  test<U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryInclude<ToWhere<EventTest>, EventTest, U>): Promise<Array<MergeIncludes<EventTest, U>>>;
  test<K extends keyof EventTest, U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventTest>, K, EventTest, U>): Promise<Array<MergeIncludes<Pick<EventTest, K>, U>>>;
}

interface Card {
  id: number;
  eventId: number;
  cardName: string;
  cardOrder: number;
  startTime: Date | null;
}

interface InsertCard {
  id?: number;
  eventId: number;
  cardName: string;
  cardOrder: number;
  startTime?: Date;
}

interface Coach {
  id: number;
  name: string;
  city: string;
  profile: null;
}

interface InsertCoach {
  id?: number;
  name: string;
  city: string;
  profile?: Json;
}

interface CoachFrom {
  id: number;
}

interface CoachQueries {
  from<U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryInclude<ToWhere<CoachFrom>, CoachFrom, U>): Promise<Array<MergeIncludes<CoachFrom, U>>>;
  from<K extends keyof CoachFrom, U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryObjectInclude<ToWhere<CoachFrom>, K, CoachFrom, U>): Promise<Array<MergeIncludes<Pick<CoachFrom, K>, U>>>;
}

interface Fighter {
  id: number;
  name: string;
  nickname: string | null;
  born: string | null;
  heightCm: number | null;
  reachCm: number | null;
  hometown: string;
  social: (Social & JsonObject) | null;
  isActive: boolean;
  phone: string[] | null;
  documents: (Document & JsonObject)[] | null;
}

interface Social {
  instagram?: string,
  twitter?: string
}

interface Document {
  documentId: number,
  documentName: string,
  files: (File & JsonObject)[]
}

interface File {
  name: string,
  tags: string[]
}

interface InsertFighter {
  id?: number;
  name: string;
  nickname?: string;
  born?: string;
  heightCm?: number;
  reachCm?: number;
  hometown: string;
  social?: Json;
  isActive: boolean;
  phone?: Json;
  documents?: Json;
}

interface ComputedFighter {
  displayName: string;
  instagram: number | string | null;
  heightInches: number | null;
}

interface FighterByHeight {
  name: string;
  heightCm: number | null;
  heightRank: number;
}

interface FighterCommon {
  red: Json;
  blue: Json;
  winnerId: number | null;
  method: string;
  description: string | null;
  event: Json;
}

interface FighterExtract {
  instagram: number | string | Buffer | null;
}

interface FighterFilter {
  name: string;
  reaches: string | null;
}

interface FighterInstagram {
  instagram: number | string | Buffer;
}

interface FighterLastFights {
  name: string;
  dates: Json;
}

interface FighterLeft {
  id: number;
  winnerId: number | null;
  winnerName: string | null;
}

interface FighterMethods {
  method: string;
  count: number;
}

interface FighterOpponents {
  opponentId: number;
  name: string;
}

interface FighterOtherNames {
  name: string;
  otherNames: Json;
}

interface FighterRight {
  id: number;
  winnerId: number;
  winnerName: string;
}

interface FighterWeightClasses {
  name: string;
  weightClasses: Json;
}

interface FighterWithReach {
  name: string;
  heightCm: number | null;
  reachCm: number | null;
  reaches: Json;
}

interface FighterCommonParams {
  fighter1: any;
  fighter2: any;
}

interface FighterExtractParams {
  path: any;
}

interface FighterLastFightsParams {
  id: any;
}

interface FighterMethodsParams {
  id: any;
}

interface FighterWeightClassesParams {
  fighterId: any;
}

interface FighterQueries {
  byHeight<U extends Includes<TypedDb, FighterByHeight>>(query: ComplexSqlQueryInclude<ToWhere<FighterByHeight>, FighterByHeight, U>): Promise<Array<MergeIncludes<FighterByHeight, U>>>;
  byHeight<K extends keyof FighterByHeight, U extends Includes<TypedDb, FighterByHeight>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterByHeight>, K, FighterByHeight, U>): Promise<Array<MergeIncludes<Pick<FighterByHeight, K>, U>>>;
  common<U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryIncludeParams<FighterCommonParams, ToWhere<FighterCommon>, FighterCommon, U>): Promise<Array<MergeIncludes<FighterCommon, U>>>;
  common<K extends keyof FighterCommon, U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryObjectIncludeParams<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, U>): Promise<Array<MergeIncludes<Pick<FighterCommon, K>, U>>>;
  extract<U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryIncludeParams<FighterExtractParams, ToWhere<FighterExtract>, FighterExtract, U>): Promise<Array<MergeIncludes<FighterExtract, U>>>;
  extract<K extends keyof FighterExtract, U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryObjectIncludeParams<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, U>): Promise<Array<MergeIncludes<Pick<FighterExtract, K>, U>>>;
  filter<U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryInclude<ToWhere<FighterFilter>, FighterFilter, U>): Promise<Array<MergeIncludes<FighterFilter, U>>>;
  filter<K extends keyof FighterFilter, U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterFilter>, K, FighterFilter, U>): Promise<Array<MergeIncludes<Pick<FighterFilter, K>, U>>>;
  instagram<U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryInclude<ToWhere<FighterInstagram>, FighterInstagram, U>): Promise<Array<MergeIncludes<FighterInstagram, U>>>;
  instagram<K extends keyof FighterInstagram, U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterInstagram>, K, FighterInstagram, U>): Promise<Array<MergeIncludes<Pick<FighterInstagram, K>, U>>>;
  lastFights<U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryIncludeParams<FighterLastFightsParams, ToWhere<FighterLastFights>, FighterLastFights, U>): Promise<Array<MergeIncludes<FighterLastFights, U>>>;
  lastFights<K extends keyof FighterLastFights, U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryObjectIncludeParams<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, U>): Promise<Array<MergeIncludes<Pick<FighterLastFights, K>, U>>>;
  left<U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryInclude<ToWhere<FighterLeft>, FighterLeft, U>): Promise<Array<MergeIncludes<FighterLeft, U>>>;
  left<K extends keyof FighterLeft, U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterLeft>, K, FighterLeft, U>): Promise<Array<MergeIncludes<Pick<FighterLeft, K>, U>>>;
  methods<U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryIncludeParams<FighterMethodsParams, ToWhere<FighterMethods>, FighterMethods, U>): Promise<Array<MergeIncludes<FighterMethods, U>>>;
  methods<K extends keyof FighterMethods, U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryObjectIncludeParams<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, U>): Promise<Array<MergeIncludes<Pick<FighterMethods, K>, U>>>;
  opponents<U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryInclude<ToWhere<FighterOpponents>, FighterOpponents, U>): Promise<Array<MergeIncludes<FighterOpponents, U>>>;
  opponents<K extends keyof FighterOpponents, U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterOpponents>, K, FighterOpponents, U>): Promise<Array<MergeIncludes<Pick<FighterOpponents, K>, U>>>;
  otherNames<U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryInclude<ToWhere<FighterOtherNames>, FighterOtherNames, U>): Promise<Array<MergeIncludes<FighterOtherNames, U>>>;
  otherNames<K extends keyof FighterOtherNames, U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterOtherNames>, K, FighterOtherNames, U>): Promise<Array<MergeIncludes<Pick<FighterOtherNames, K>, U>>>;
  right<U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryInclude<ToWhere<FighterRight>, FighterRight, U>): Promise<Array<MergeIncludes<FighterRight, U>>>;
  right<K extends keyof FighterRight, U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterRight>, K, FighterRight, U>): Promise<Array<MergeIncludes<Pick<FighterRight, K>, U>>>;
  weightClasses<U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryIncludeParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, FighterWeightClasses, U>): Promise<Array<MergeIncludes<FighterWeightClasses, U>>>;
  weightClasses<K extends keyof FighterWeightClasses, U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryObjectIncludeParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, U>): Promise<Array<MergeIncludes<Pick<FighterWeightClasses, K>, U>>>;
  withReach<U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryInclude<ToWhere<FighterWithReach>, FighterWithReach, U>): Promise<Array<MergeIncludes<FighterWithReach, U>>>;
  withReach<K extends keyof FighterWithReach, U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterWithReach>, K, FighterWithReach, U>): Promise<Array<MergeIncludes<Pick<FighterWithReach, K>, U>>>;
}

interface OtherName {
  id: number;
  fighterId: number;
  name: string;
}

interface InsertOtherName {
  id?: number;
  fighterId: number;
  name: string;
}

interface FighterCoach {
  id: number;
  coachId: number;
  fighterId: number;
  startDate: string;
  endDate: string | null;
}

interface InsertFighterCoach {
  id?: number;
  coachId: number;
  fighterId: number;
  startDate: string;
  endDate?: string;
}

interface Ranking {
  id: number;
  fighterId: number;
  weightClassId: number;
  rank: number;
  isInterim: boolean;
}

interface InsertRanking {
  id?: number;
  fighterId: number;
  weightClassId: number;
  rank: number;
  isInterim: boolean;
}

interface Method {
  id: number;
  name: string;
  abbreviation: string;
}

interface InsertMethod {
  id?: number;
  name: string;
  abbreviation: string;
}

interface MethodByFighter {
  method: string;
  count: number;
}

interface MethodCoach {
  fit: number | string | Buffer;
  test: Json;
  tests: Json;
  profile: Json;
}

interface MethodTopSubmission {
  methodDescription: string | null;
}

interface MethodByFighterParams {
  fighterId: any;
}

interface MethodQueries {
  byFighter<U extends Includes<TypedDb, MethodByFighter>>(query: ComplexSqlQueryIncludeParams<MethodByFighterParams, ToWhere<MethodByFighter>, MethodByFighter, U>): Promise<Array<MergeIncludes<MethodByFighter, U>>>;
  byFighter<K extends keyof MethodByFighter, U extends Includes<TypedDb, MethodByFighter>>(query: ComplexSqlQueryObjectIncludeParams<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, U>): Promise<Array<MergeIncludes<Pick<MethodByFighter, K>, U>>>;
  coach<U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryInclude<ToWhere<MethodCoach>, MethodCoach, U>): Promise<Array<MergeIncludes<MethodCoach, U>>>;
  coach<K extends keyof MethodCoach, U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryObjectInclude<ToWhere<MethodCoach>, K, MethodCoach, U>): Promise<Array<MergeIncludes<Pick<MethodCoach, K>, U>>>;
  topSubmission<U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryInclude<ToWhere<MethodTopSubmission>, MethodTopSubmission, U>): Promise<Array<MergeIncludes<MethodTopSubmission, U>>>;
  topSubmission<K extends keyof MethodTopSubmission, U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryObjectInclude<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, U>): Promise<Array<MergeIncludes<Pick<MethodTopSubmission, K>, U>>>;
}

interface Fight {
  id: number;
  cardId: number;
  fightOrder: number;
  blueId: number;
  redId: number;
  winnerId: number | null;
  methodId: number | null;
  methodDescription: string | null;
  endRound: number | null;
  endSeconds: number | null;
  titleFight: boolean;
  isInterim: boolean;
  weightClassId: number | null;
  oddsBlue: number | null;
  oddsRed: number | null;
  catchweightLbs: number | null;
}

interface InsertFight {
  id?: number;
  cardId: number;
  fightOrder: number;
  blueId: number;
  redId: number;
  winnerId?: number;
  methodId?: number;
  methodDescription?: string;
  endRound?: number;
  endSeconds?: number;
  titleFight: boolean;
  isInterim: boolean;
  weightClassId?: number;
  oddsBlue?: number;
  oddsRed?: number;
  catchweightLbs?: number;
}

interface FightByFighter {
  opponent: string;
  win: boolean | null;
  winnerId: number | null;
  method: string;
  methodDescription: string | null;
  eventName: string;
  startTime: Date;
  endRound: number | null;
  endSeconds: number | null;
  titleFight: boolean;
  name: string;
}

interface FightByFighterParams {
  id: any;
}

interface FightQueries {
  byFighter<U extends Includes<TypedDb, FightByFighter>>(query: ComplexSqlQueryIncludeParams<FightByFighterParams, ToWhere<FightByFighter>, FightByFighter, U>): Promise<Array<MergeIncludes<FightByFighter, U>>>;
  byFighter<K extends keyof FightByFighter, U extends Includes<TypedDb, FightByFighter>>(query: ComplexSqlQueryObjectIncludeParams<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, U>): Promise<Array<MergeIncludes<Pick<FightByFighter, K>, U>>>;
}

interface CancelledFight {
  id: number;
  cardId: number;
  cardOrder: number;
  blueId: number;
  redId: number;
  cancelledAt: Date;
  cancellationReason: string | null;
}

interface InsertCancelledFight {
  id?: number;
  cardId: number;
  cardOrder: number;
  blueId: number;
  redId: number;
  cancelledAt: Date;
  cancellationReason?: string;
}

interface TitleRemoval {
  id: number;
  fighterId: number;
  weightClassId: number;
  isInterim: boolean;
  removedAt: Date;
  reason: string;
}

interface InsertTitleRemoval {
  id?: number;
  fighterId: number;
  weightClassId: number;
  isInterim: boolean;
  removedAt: Date;
  reason: string;
}

interface FighterProfile {
  rowid: number;
  name: string;
  hometown: string;
}

interface InsertFighterProfile {
  rowid?: number;
  name: string;
  hometown: string;
}

interface Opponent {
  fightId: number;
  startTime: Date;
  fighterId: number;
  opponentId: number;
  methodId: number | null;
}

type ExtractKeys<U> = U extends Record<string, any> ? keyof U : keyof {};

interface Keywords<T, K> {
  orderBy?: K | ((column: T, method: ComputeMethods) => void);
  desc?: boolean;
  limit?: number;
  offset?: number;
  distinct?: boolean;
}

interface Includes<T, R> {
  [key: string]: (tables: T, columns: R) => any;
}

type ObjectFunction = {
  [key: string]: (...args: any) => any;
}

type MergeIncludes<T, U extends ObjectFunction> = 
  T & { [K in keyof U]: ReturnType<U[K]> extends Promise<infer R> ? (R extends any[] ? R : R | null) : never;
};

type ReturnTypes<T extends ObjectFunction> = {
  [K in keyof T]: ReturnType<T[K]>;
};

type ConvertAlias<T, U extends ObjectFunction> = 
  T & { [K in keyof U]: ReturnType<U[K]> extends Promise<infer R> ? R : never;
};

type IncludeWhere<U extends ObjectFunction> = {
  [K in keyof U]: ReturnType<U[K]> extends Promise<infer R>
    ? R extends string | number | Date | boolean ? R | Array<R> | WhereFunction<R> | null : never : never;
}

interface VirtualKeywords<T> {
  rank?: true;
  bm25?: Record<keyof Omit<T, "rowid">, number>;
  limit?: number;
  offset?: number;
}

interface Highlighter<T> extends VirtualKeywords<T> {
  highlight: { column: keyof T, tags: [string, string] };
}

interface Snippet<T> extends VirtualKeywords<T> {
  snippet: { column: keyof T, tags: [string, string], trailing: string, tokens: number };
}

interface HighlightQuery<W, T> extends Highlighter<T> {
  where?: W;
}

interface SnippetQuery<W, T> extends Snippet<T> {
  where?: W;
}

interface VirtualQuery<W, T> extends VirtualKeywords<T> {
  where?: W;
}

interface VirtualQueryObject<W, K, T> extends VirtualQuery<W, T> {
  select: (keyof T)[] | K[];
}

interface VirtualQueryValue<W, K, T> extends VirtualQuery<W, T> {
  select: K;
}

interface AggregateQuery<W, K> {
  where?: W;
  column?: K;
  distinct?: K;
}

interface AggregateQueryDebug<W, K> extends AggregateQuery<W, K> {
  debug: true;
}

interface ComplexQueryInclude<W, T, U extends ObjectFunction, C> extends Keywords<T & C, Array<keyof (T & C)> | keyof (T & C)> {
  where?: W;
  select?: undefined;
  include?: U;
}

interface ComplexSqlQueryIncludeParams<P, W, T, R extends ObjectFunction> extends ComplexQueryInclude<W, T, R, unknown> {
  params: P;
}

interface ComplexSqlQueryInclude<W, T, R extends ObjectFunction> extends ComplexQueryInclude<W, T, R, unknown> {
  params?: undefined;
}

interface ComplexSqlQueryIncludeParamsDebug<P, W, T, R extends ObjectFunction> extends ComplexSqlQueryIncludeParams<P, W, T, R> {
  debug: true;
}

interface ComplexSqlQueryIncludeDebug<W, T, R extends ObjectFunction> extends ComplexSqlQueryInclude<W, T, R> {
  debug: true;
}

interface ComplexQueryIncludeDebug<W, T, U extends ObjectFunction, C> extends ComplexQueryInclude<W, T, U, C> {
  debug: true;
}

interface ComplexQueryObjectInclude<W, K, T, U extends ObjectFunction, C> extends Keywords<T & C, keyof (T & C) | Array<keyof (T & C)>> {
  where?: W;
  select: (keyof (T & C))[] | K[];
  include?: U;
}

interface ComplexSqlQueryObjectIncludeParams<P, W, K, T, R extends ObjectFunction> extends ComplexQueryObjectInclude<W, K, T, R, unknown> {
  params: P;
}

interface ComplexSqlQueryObjectInclude<W, K, T, R extends ObjectFunction> extends ComplexQueryObjectInclude<W, K, T, R, unknown> {
  params?: undefined;
}

interface ComplexSqlQueryObjectIncludeParamsDebug<P, W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeParams<P, W, K, T, R> {
  debug: true;
}

interface ComplexSqlQueryObjectIncludeDebug<W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectInclude<W, K, T, R> {
  debug: true;
}

interface ComplexQueryObjectIncludeDebug<W, K, T, U extends ObjectFunction, C> extends ComplexQueryObjectInclude<W, K, T, U, C> {
  debug: true;
}

interface ComplexQueryObjectIncludeOmit<W, K, T, U extends ObjectFunction, C> extends Keywords<T & C, keyof (T & C) | Array<keyof (T & C)>> {
  where?: W;
  select?: undefined;
  omit: (keyof T)[] | K[] | K;
  include?: U;
}

interface ComplexSqlQueryObjectIncludeOmitParams<P, W, K, T, R extends ObjectFunction> extends ComplexQueryObjectIncludeOmit<W, K, T, R, unknown> {
  params: P;
}

interface ComplexSqlQueryObjectIncludeOmit<W, K, T, R extends ObjectFunction> extends ComplexQueryObjectIncludeOmit<W, K, T, R, unknown> {
  params?: undefined;
}

interface ComplexSqlQueryObjectIncludeOmitParamsDebug<P, W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeOmitParams<P, W, K, T, R> {
  debug: true;
}

interface ComplexSqlQueryObjectIncludeOmitDebug<W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeOmit<W, K, T, R> {
  debug: true;
}

interface ComplexQueryObjectIncludeOmitDebug<W, K, T, U extends ObjectFunction, C> extends ComplexQueryObjectIncludeOmit<W, K, T, U, C> {
  debug: true;
}

interface ComplexQueryValue<W, K, T, C> extends Keywords<T & C, Array<keyof (T & C)> | keyof (T & C)> {
  where?: W;
  select: K;
  omit?: undefined;
  include?: undefined;
}

interface ComplexSqlQueryValueParams<P, W, K, T> extends ComplexQueryValue<W, K, T, unknown> {
  params: P;
}

interface ComplexSqlQueryValue<W, K, T> extends ComplexQueryValue<W, K, T, unknown> {
  params?: undefined;
}

interface ComplexSqlQueryValueParamsDebug<P, W, K, T> extends ComplexSqlQueryValueParams<P, W, K, T> {
  debug: true;
}

interface ComplexSqlQueryValueDebug<W, K, T> extends ComplexSqlQueryValue<W, K, T> {
  debug: true;
}

interface ComplexQueryValueDebug<W, K, T, C> extends ComplexQueryValue<W, K, T, C> {
  debug: true;
}

type MakeOptionalNullable<T> = {
  [K in keyof T]: undefined extends T[K] ? T[K] | null : T[K];
};

type AddComputed<T> = {
  [K in keyof T]: T[K] | ((column: T, methods: ComputeMethods) => void);
};

interface UpdateQuery<W, T> {
  where?: W | null;
  set: Partial<AddComputed<MakeOptionalNullable<T>>>;
}

interface UpsertQuery<T, K> {
  values: T;
  target?: K;
  set?: Partial<MakeOptionalNullable<T>>;
}

interface DebugQuery {
  sql: string;
  params?: any;
}

interface DebugResult<R> {
  result: R;
  queries: Array<DebugQuery>;
}

interface GroupQueryKeywords<W, K, U> {
  where?: W;
  orderBy?: K;
  desc?: boolean;
  limit?: number;
  offset?: number;
  include?: U;
}

interface GroupQueryCountStarColumn<A extends string, T, W, K, U> extends GroupQueryKeywords<W, K, U> {
  column: {
    [key in A]: true | keyof T;
  }
}

interface GroupQueryCountStarDistinct<A extends string, T, W, K, U> extends GroupQueryKeywords<W, K, U> {
  distinct: {
    [key in A]: true | keyof T;
  }
}

interface GroupQueryAggregateColumn<A extends string, T, W, K, U> extends GroupQueryKeywords<W, K, U> {
  column: {
    [key in A]: keyof T;
  }
}

interface GroupQueryAggregateDistinct<A extends string, T, W, K, U> extends GroupQueryKeywords<W, K, U> {
  distinct: {
    [key in A]: keyof T;
  }
}

interface GroupQueryObjectAlias<T, W, K, U, A> {
  where?: W;
  column?: keyof T;
  distinct?: keyof T;
  orderBy?: K;
  desc?: boolean;
  limit?: number;
  offset?: number;
  include?: U;
}

interface GroupArrayKeywords<W, K, U> {
  where?: W;
  orderBy?: K;
  desc?: boolean;
  limit?: number;
  offset?: number;
  include?: U;
}

interface GroupArray<A extends string, W, K, U> extends GroupArrayKeywords<W, K, U> {
  select: {
    [key in A]: true;
  }
}

interface GroupArraySelect<A extends string, W, K, U, S> extends GroupArrayKeywords<W, K, U> {
  select: {
    [key in A]: S[];
  }
}

interface GroupArrayValue<A extends string, W, K, U, S> extends GroupArrayKeywords<W, K, U> {
  select: {
    [key in A]: S;
  }
}

interface AggregateMethods<T, W, C, K extends keyof (T & C), Y> {
  count<A extends string, U extends Includes<Y, (Pick<(T & C), K> & { count: number })>>(params?: GroupQueryCountStarColumn<A, T, W & ToWhere<{ count: number }>, K | 'count', U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { [key in A]: number }, U>>>;
  count<A extends string, U extends Includes<Y, (Pick<(T & C), K> & { count: number })>>(params?: GroupQueryCountStarDistinct<A, T, W & ToWhere<{ count: number }>, K | 'count', U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { [key in A]: number }, U>>>;
  avg<A extends string, U extends Includes<Y, (Pick<(T & C), K> & { avg: number })>>(params: GroupQueryAggregateColumn<A, T, W & ToWhere<{ avg: number }>, K | 'avg', U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { [key in A]: number }, U>>>;
  avg<A extends string, U extends Includes<Y, (Pick<(T & C), K> & { avg: number })>>(params: GroupQueryAggregateDistinct<A, T, W & ToWhere<{ avg: number }>, K | 'avg', U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { [key in A]: number }, U>>>;
  max<A extends string, U extends Includes<Y, (Pick<(T & C), K> & { max: number })>>(params: GroupQueryAggregateColumn<A, T, W & ToWhere<{ avg: number }>, K | 'max', U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { [key in A]: number }, U>>>;
  max<A extends string, U extends Includes<Y, (Pick<(T & C), K> & { max: number })>>(params: GroupQueryAggregateDistinct<A, T, W & ToWhere<{ avg: number }>, K | 'max', U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { [key in A]: number }, U>>>;
  min<A extends string, U extends Includes<Y, (Pick<(T & C), K> & { min: number })>>(params: GroupQueryAggregateColumn<A, T, W & ToWhere<{ avg: number }>, K | 'min', U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { [key in A]: number }, U>>>;
  min<A extends string, U extends Includes<Y, (Pick<(T & C), K> & { min: number })>>(params: GroupQueryAggregateDistinct<A, T, W & ToWhere<{ avg: number }>, K | 'min', U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { [key in A]: number }, U>>>;
  sum<A extends string, U extends Includes<Y, (Pick<(T & C), K> & { sum: number })>>(params: GroupQueryAggregateColumn<A, T, W & ToWhere<{ avg: number }>, K | 'sum', U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { [key in A]: number }, U>>>;
  sum<A extends string, U extends Includes<Y, (Pick<(T & C), K> & { sum: number })>>(params: GroupQueryAggregateDistinct<A, T, W & ToWhere<{ avg: number }>, K | 'sum', U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { [key in A]: number }, U>>>;
  array<A extends string, S extends keyof (T & C), U extends Includes<Y, Pick<(T & C), K>>>(params: GroupArrayValue<A, W & ToWhere<{ sum: number }>, K, U, S>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { [key in A]: Array<(T & C)[S]> }, U>>>;
  array<A extends string, U extends Includes<Y, Pick<(T & C), K>>>(params: GroupArray<A, W & ToWhere<{ sum: number }>, K, U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { [key in A]: Array<T> }, U>>>;
  array<A extends string, S extends keyof (T & C), U extends Includes<Y, Pick<(T & C), K>>>(params: GroupArraySelect<A, W & ToWhere<{ sum: number }>, K, U, S>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { [key in A]: Array<Pick<(T & C), S>> }, U>>>;
}

declare const dbNumber1: unique symbol;
declare const dbNumber2: unique symbol;

type DbNumber = typeof dbNumber1 | typeof dbNumber2;

declare const dbString1: unique symbol;
declare const dbString2: unique symbol;

type DbString = typeof dbString1 | typeof dbString2;

declare const dbBoolean1: unique symbol;
declare const dbBoolean2: unique symbol;

type DbBoolean = typeof dbBoolean1 | typeof dbBoolean2;

declare const dbDate1: unique symbol;
declare const dbDate2: unique symbol;

type DbDate = typeof dbDate1 | typeof dbDate2;

declare const dbJson1: unique symbol;
declare const dbJson2: unique symbol;

type DbJson = typeof dbJson1 | typeof dbJson2;

declare const dbBuffer1: unique symbol;
declare const dbBuffer2: unique symbol;

type DbBuffer = typeof dbBuffer1 | typeof dbBuffer2;

declare const dbNull1: unique symbol;
declare const dbNull2: unique symbol;

type DbNull = typeof dbNull1 | typeof dbNull2;

type DbAny = DbNumber | DbString | DbBuffer | DbJson | DbDate | DbBoolean;
type AnyParam = DbAny | DbNull;

type AllowedJson = DbNumber | DbString | DbJson | DbDate | DbBoolean | DbNull | { [key: string]: AllowedJson } | AllowedJson[];
type SelectType = AllowedJson | AllowedJson[] | SelectType[] | { [key: string | symbol]: AllowedJson };

type NumberParam = number | null | DbNumber | DbNull;
type NumberResult = DbNumber | DbNull;

type StringParam = string | null | DbString | DbNull;
type StringResult = DbString | DbNull;

type NumberBufferParam = number | Buffer | null | DbNumber | DbBuffer | DbNull;
type StringBufferParam = string | Buffer | null | DbString | DbBuffer | DbNull;

type AnyResult = DbAny | DbNull;

type BufferResult = DbBuffer | DbNull;

type DateParam = number | string | null | DbNumber | DbString | DbDate | DbNull;
type DateResult = DbDate | DbNull;

type BooleanParam = boolean | DbBoolean;
type BooleanResult = DbBoolean | DbNull;

type JsonParam = string | Buffer | null | DbString | DbBuffer | DbJson | DbNull;
type ExtractResult = DbString | DbNumber | DbNull;
type JsonResult = DbJson | DbNull;

type DbTypes = number | string | boolean | Date | Buffer | null;

type IfOddArgs<T> = 
  [BooleanParam, T, T] | 
  [BooleanParam, T, BooleanParam, T, T] | 
  [BooleanParam, T, BooleanParam, T, BooleanParam, T, T] | 
  [BooleanParam, T, BooleanParam, T, BooleanParam, T, BooleanParam, T, T] | 
  [BooleanParam, T, BooleanParam, T, BooleanParam, T, BooleanParam, T, BooleanParam, T, T] |
  [BooleanParam, T, BooleanParam, T, BooleanParam, T, BooleanParam, T, BooleanParam, T, BooleanParam, T, T];

type IfEvenArgs<T> = 
  [BooleanParam, T] | 
  [BooleanParam, T, BooleanParam, T] | 
  [BooleanParam, T, BooleanParam, T, BooleanParam, T] | 
  [BooleanParam, T, BooleanParam, T, BooleanParam, T, BooleanParam, T] | 
  [BooleanParam, T, BooleanParam, T, BooleanParam, T, BooleanParam, T, BooleanParam, T] |
  [BooleanParam, T, BooleanParam, T, BooleanParam, T, BooleanParam, T, BooleanParam, T, BooleanParam, T];

interface ComputeMethods {
  abs(n: NumberParam): NumberResult;
  coalesce(a: StringResult, b: string): DbString;
  coalesce(a: NumberResult, b: number): DbNumber;
  coalesce(a: BooleanResult, b: boolean): DbBoolean;
  coalesce(a: DateResult, b: Date): DbDate;
  coalesce<T extends DbAny>(a: T, b: T, ...rest: T[]): T;
  coalesce(a: any, b: any, ...rest: any[]): AnyResult;
  concat(...args: any[]): DbString;
  concatWs(...args: any[]): DbString;
  format(format: StringParam, ...args: any[]): StringResult;
  glob(pattern: StringParam, value: StringParam): NumberResult;
  if<T extends DbTypes | DbAny>(...args: IfOddArgs<T>): ToDbType<T>;
  if<T extends DbTypes | DbAny>(...args: IfEvenArgs<T>): ToDbType<T | null>;
  if(...args: any[]): AnyResult;
  instr(a: StringBufferParam, b: StringBufferParam): NumberResult;
  length(value: any): NumberResult;
  lower<T extends StringResult>(value: T): T;
  lower(value: StringParam): StringResult;
  ltrim(value: StringParam, remove?: StringParam): StringResult;
  max(a: DbNumber, b: number): DbNumber;
  max<T extends DbAny>(a: T, b: T, ...rest: T[]): T;
  max(a: any, b: any, ...rest: any[]): AnyResult;
  min(a: DbNumber, b: number): DbNumber;
  min<T extends DbAny>(a: T, b: T, ...rest: T[]): T;
  min(a: any, b: any, ...rest: any[]): AnyResult;
  nullif<T extends DbAny>(a: T, b: any): T | DbNull;
  nullif(a: any, b: any): AnyResult;
  octetLength(value: any): NumberResult;
  replace(value: StringParam, occurances: StringParam, substitute: StringParam): StringResult;
  round(value: NumberParam, places?: NumberParam): NumberResult;
  rtrim(value: StringParam, remove?: StringParam): StringResult;
  sign(value: any): NumberResult;
  substring(value: StringParam, start: NumberParam, length?: NumberParam): StringResult;
  trim(value: StringParam, remove?: StringParam): StringResult;
  unhex(hex: StringParam, ignore?: StringParam): BufferResult;
  unicode(value: StringParam): NumberResult;
  upper<T extends StringResult>(value: T): T;
  upper(value: StringParam): StringResult;
  date(time?: DateParam, ...modifers: StringParam[]): StringResult;
  time(time?: DateParam, ...modifers: StringParam[]): StringResult;
  dateTime(time?: DateParam, ...modifers: StringParam[]): StringResult;
  julianDay(time?: DateParam, ...modifers: StringParam[]): StringResult;
  unixEpoch(time?: DateParam, ...modifers: StringParam[]): StringResult;
  strfTime(format: StringParam, time: DateParam, ...modifers: StringParam[]): StringResult;
  timeDiff(start: DateParam, end: DateParam): StringResult;
  acos(value: NumberParam): NumberResult;
  acosh(value: NumberParam): NumberResult;
  asin(value: NumberParam): NumberResult;
  asinh(value: NumberParam): NumberResult;
  atan(value: NumberParam): NumberResult;
  atan2(b: NumberParam, a: NumberParam): NumberResult;
  atanh(value: NumberParam): NumberResult;
  ceil(value: NumberParam): NumberResult;
  cos(value: NumberParam): NumberResult;
  cosh(value: NumberParam): NumberResult;
  degrees(value: NumberParam): NumberResult;
  exp(value: NumberParam): NumberResult;
  floor(value: NumberParam): NumberResult;
  ln(value: NumberParam): NumberResult;
  log(base: NumberParam, value: NumberParam): NumberResult;
  mod(value: NumberParam, divider: NumberParam): NumberResult;
  pi(): NumberResult;
  power(value: NumberParam, exponent: NumberParam): NumberResult;
  radians(value: NumberParam): NumberResult;
  sin(value: NumberParam): NumberResult;
  sinh(value: NumberParam): NumberResult;
  sqrt(value: NumberParam): NumberResult;
  tan(value: NumberParam): NumberResult;
  tanh(value: NumberParam): NumberResult;
  trunc(value: NumberParam): NumberResult;
  json(param: JsonParam | any[]): StringResult;
  extract(json: JsonParam | any[], path: StringParam): ExtractResult;
  plus(...args: DbNumber[]): DbNumber;
  plus(...args: NumberParam[]): NumberResult;
  minus(...args: DbNumber[]): DbNumber;
  minus(...args: NumberParam[]): NumberResult;
  divide(...args: DbNumber[]): DbNumber;
  divide(...args: NumberParam[]): NumberResult;
  multiply(...args: DbNumber[]): DbNumber;
  multiply(...args: NumberParam[]): NumberResult;
  object<T extends { [key: string]: AllowedJson }>(select: T): ToJson<T>;
  arrayLength(param: JsonParam | any[]): NumberResult;
}

interface FrameOptions {
  type: 'rows' | 'groups' | 'range';
  currentRow?: true;
  preceding?: 'unbounded' | number;
  following?: 'unbounded' | number;
}

interface WindowOptions {
  partitionBy?: symbol | symbol[];
  where?: { [key: symbol]: symbol };
  orderBy?: symbol | symbol[];
  desc?: true;
  frame?: FrameOptions;
}

type ToJson<T> =
  T extends DbDate ? DbString :
  T extends (infer U)[] ? ToJson<U>[] :
  T extends object ? InterfaceToJson<T> :
  T;

type InterfaceToJson<T> = {
  [K in keyof T]: ToJson<T[K]>;
};

type ToDbType<T> =
  T extends null ? DbNull :
  T extends infer U ? (
    U extends number ? DbNumber :
    U extends string ? DbString :
    U extends Date ? DbDate :
    U extends boolean ? DbBoolean :
    U extends null ? DbNull :
    U extends Json ? DbJson :
    DbJson
  ) : T;

type ToDbInterface<T> = {
  [K in keyof T]: ToDbType<T[K]>;
};

type ToJsType<T> =
  T extends DbNull ? null :
  T extends (infer U)[] ? ToJsType<U>[] :
  T extends object
    ? {
        [K in keyof T]: ToJsType<T[K]>
      }
  : T extends DbNumber ? number :
    T extends DbString ? string :
    T extends DbDate ? Date :
    T extends DbBoolean ? boolean :
    T extends DbJson ? Json :
    never;

interface LagOptions<T> {
  expression: T;
  offset?: number | DbNumber;
  otherwise?: T;
}

interface SymbolMethods {
  count(): DbNumber;
  count(column: AnyResult): DbNumber;
  count(options: WindowOptions & { distinct: AnyResult }): DbNumber;
  count(options: WindowOptions & { column: AnyResult }): DbNumber;
  min<T extends AnyParam>(column: T): T;
  min<T extends AnyParam>(options: WindowOptions & { distinct: T }): T;
  min<T extends AnyParam>(options: WindowOptions & { column: T }): T;
  max<T extends AnyParam>(column: T): T;
  max<T extends AnyParam>(options: WindowOptions & { distinct: T }): T;
  max<T extends AnyParam>(options: WindowOptions & { column: T }): T;
  avg<T extends NumberResult>(column: T): T;
  avg<T extends NumberResult>(options: WindowOptions & { distinct: T }): T;
  avg<T extends NumberResult>(options: WindowOptions & { column: T }): T;
  sum<T extends NumberResult>(column: T): T;
  sum<T extends NumberResult>(options: WindowOptions & { distinct: T }): T;
  sum<T extends NumberResult>(options: WindowOptions & { column: T }): T;
  rowNumber(options?: WindowOptions): DbNumber;
  rank(options?: WindowOptions): DbNumber;
  denseRank(options?: WindowOptions): DbNumber;
  percentRank(options?: WindowOptions): DbNumber;
  cumeDist(options?: WindowOptions): DbNumber;
  ntile(options: WindowOptions & { groups: number | DbNumber }): DbNumber;
  lag<T extends DbAny>(options: WindowOptions & LagOptions<T>): T;
  lead<T extends DbAny>(options: WindowOptions & LagOptions<T>): T;
  firstValue<T extends DbAny>(options: WindowOptions & { expression: T }): T;
  lastValue<T extends DbAny>(options: WindowOptions & { expression: T }): T;
  nthValue<T extends DbAny>(options: WindowOptions & { expression: T, row: number | DbNumber }): T;
  group<T extends AllowedJson>(options: WindowOptions & { select: T }): ToJson<T>[];
  group<T extends AllowedJson>(select: T): ToJson<T>[];
  group<T>(select: ToDbInterface<T>): ToJson<T>[];
  group<T extends AllowedJson>(key: DbString, value: T): Record<string, ToJson<T>>;
  group<T extends AllowedJson>(options: WindowOptions & { key: DbString, value: T }): Record<string, ToJson<T>>;
}

interface Compute<T> {
  [key: string]: (column: T, method: ComputeMethods) => void;
}

interface Tables {
  weightClasses: ToDbInterface<WeightClass>;
  locations: ToDbInterface<Location>;
  events: ToDbInterface<Event>;
  cards: ToDbInterface<Card>;
  coaches: ToDbInterface<Coach>;
  fighters: ToDbInterface<Fighter>;
  otherNames: ToDbInterface<OtherName>;
  fighterCoaches: ToDbInterface<FighterCoach>;
  rankings: ToDbInterface<Ranking>;
  methods: ToDbInterface<Method>;
  fights: ToDbInterface<Fight>;
  cancelledFights: ToDbInterface<CancelledFight>;
  titleRemovals: ToDbInterface<TitleRemoval>;
  fighterProfiles: ToDbInterface<FighterProfile>;
  opponents: ToDbInterface<Opponent>;
}

interface VirtualQueries<T, W> {
  [key: string]: any;
  get(params?: W | null): Promise<T | undefined>;
  get<K extends keyof T>(params: W | null, columns: Array<keyof T>): Promise<Pick<T, K> | undefined>;
  get<K extends keyof T>(params: W | null, column: K): Promise<T[K] | undefined>;
  get<N>(params: W | null, column: (selector: T) => N): Promise<N | undefined>;
  get(query: HighlightQuery<W, T>): Promise<{ id: number, highlight: string } | undefined>;
  get(query: SnippetQuery<W, T>): Promise<{ id: number, snippet: string } | undefined>;
  many(params?: W | null): Promise<Array<T>>;
  many<K extends keyof T>(params: W | null, columns: Array<keyof T>): Promise<Array<Pick<T, K>>>;
  many<K extends keyof T>(params: W | null, column: K): Promise<Array<T[K]>>;
  many<N>(params: W | null, column: (selector: TableObject<T>) => N): Promise<Array<N>>;
  query<K extends keyof T>(query: VirtualQueryObject<W, K, T>): Promise<Array<Pick<T, K>>>;
  query<K extends keyof T>(query: VirtualQueryValue<W, K, T>): Promise<Array<T[K]>>;
  query(query: VirtualQuery<W, T>): Promise<Array<T>>; 
  query(query: HighlightQuery<W, T>): Promise<Array<{ id: number, highlight: string }>>;
  query(query: SnippetQuery<W, T>): Promise<Array<{ id: number, snippet: string }>>;
}

interface Queries<T, I, W, C, R, Y> {
  [key: string]: any;
  insert(params: I): Promise<R>;
  insertMany(params: Array<I>): Promise<void>;
  update(options: UpdateQuery<W, I>): Promise<number>;
  upsert<K extends keyof T>(options: UpsertQuery<I, K>): Promise<R>;
  get(params?: W | null): Promise<T | undefined>;
  get<K extends keyof (T & C)>(params: W | null, column: K): Promise<(T & C)[K] | undefined>;
  get<K extends keyof (T & C)>(params: W | null, columns: (keyof (T & C))[] | K[]): Promise<Pick<(T & C), K> | undefined>;
  get<N>(params: W | null, column: (selector: T) => N): Promise<N | undefined>;
  many(params?: W): Promise<Array<T>>;
  many<K extends keyof (T & C)>(params: W | null, columns: (keyof (T & C))[] | K[]): Promise<Array<Pick<(T & C), K>>>;
  many<K extends keyof (T & C)>(params: W | null, column: K): Promise<Array<(T & C)[K]>>;
  query(): Promise<Array<T>>;
  query<K extends keyof (T & C)>(query: ComplexQueryValue<W, K, T, C>): Promise<Array<(T & C)[K]>>;
  query<K extends keyof (T & C)>(query: ComplexQueryValueDebug<W, K, T, C>): Promise<DebugResult<Array<(T & C)[K]>>>;
  query<K extends keyof (T & C), U extends Includes<Y, T>>(query: ComplexQueryObjectInclude<W, K, T, U, C>): Promise<Array<MergeIncludes<Pick<(T & C), K>, U>>>;
  query<K extends keyof (T & C), U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeDebug<W, K, T, U, C>): Promise<DebugResult<Array<MergeIncludes<Pick<(T & C), K>, U>>>>;
  query<K extends keyof (T & C), U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeOmit<W, K, T, U, C>): Promise<Array<MergeIncludes<Omit<T, K>, U>>>;
  query<K extends keyof (T & C), U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeOmitDebug<W, K, T, U, C>): Promise<DebugResult<Array<MergeIncludes<Omit<T, K>, U>>>>;
  query<U extends Includes<Y, T>>(query: ComplexQueryInclude<W, T, U, C>): Promise<Array<MergeIncludes<T, U>>>;
  query<U extends Includes<Y, T>>(query: ComplexQueryIncludeDebug<W, T, U, C>): Promise<DebugResult<Array<MergeIncludes<T, U>>>>;
  first(): Promise<T | undefined>;
  first<K extends keyof (T & C)>(query: ComplexQueryValue<W, K, T, C>): Promise<(T & C)[K] | undefined>;
  first<K extends keyof (T & C)>(query: ComplexQueryValueDebug<W, K, T, C>): Promise<DebugResult<(T & C)[K] | undefined>>;
  first<K extends keyof (T & C), U extends Includes<Y, T>>(query: ComplexQueryObjectInclude<W, K, T, U, C>): Promise<MergeIncludes<Pick<(T & C), K>, U> | undefined>;
  first<K extends keyof (T & C), U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeDebug<W, K, T, U, C>): Promise<DebugResult<MergeIncludes<Pick<(T & C), K>, U> | undefined>>;
  first<K extends keyof (T & C), U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeOmit<W, K, T, U, C>): Promise<MergeIncludes<Omit<T, K>, U> | undefined>;
  first<K extends keyof (T & C), U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeOmitDebug<W, K, T, U, C>): Promise<DebugResult<MergeIncludes<Omit<T, K>, U> | undefined>>;
  first<U extends Includes<Y, T>>(query: ComplexQueryInclude<W, T, U, C>): Promise<MergeIncludes<(T & C), U> | undefined>;
  first<U extends Includes<Y, T>>(query: ComplexQueryIncludeDebug<W, T, U, C>): Promise<DebugResult<MergeIncludes<(T & C), U> | undefined>>;
  count<K extends keyof (T & C)>(query?: AggregateQuery<W, K>): Promise<number>;
  avg<K extends keyof (T & C)>(query: AggregateQuery<W, K>): Promise<number>;
  max<K extends keyof (T & C)>(query: AggregateQuery<W, K>): Promise<(T & C)[K]>;
  min<K extends keyof (T & C)>(query: AggregateQuery<W, K>): Promise<(T & C)[K]>;
  sum<K extends keyof (T & C)>(query: AggregateQuery<W, K>): Promise<number>;
  exists(params: W | null): Promise<boolean>;
  groupBy<K extends keyof (T & C)>(columns: K | Array<K>): AggregateMethods<T, W, C, K, Y>;
  compute(properties: Compute<T>): void;
  remove(params?: W): Promise<number>;
}

type CompareMethods<T> = {
  not: (value: T) => symbol;
	gt: (value: NonNullable<T>) => symbol;
	lt: (value: NonNullable<T>) => symbol;
	lte: (value: NonNullable<T>) => symbol;
	like: (pattern: NonNullable<T>) => symbol;
	match: (pattern: NonNullable<T>) => symbol;
	glob: (pattern: NonNullable<T>) => symbol;
	eq: (value: T) => symbol;
}

type SymbolCompareMethods<T> = {
  not: (column: symbol, value: T) => DbBoolean;
	gt: (column: symbol, value: NonNullable<T>) => DbBoolean;
	lt: (column: symbol, value: NonNullable<T>) => DbBoolean;
	lte: (column: symbol, value: NonNullable<T>) => DbBoolean;
	like: (column: symbol, pattern: NonNullable<T>) => DbBoolean;
	match: (column: symbol, pattern: NonNullable<T>) => DbBoolean;
	glob: (column: symbol, pattern: NonNullable<T>) => DbBoolean;
	eq: (column: symbol, value: T) => DbBoolean;
}

type Transform<T> = NonNullable<T> extends string | number | Date
  ? CompareMethods<T>
  : NonNullable<T> extends boolean
  ? Pick<CompareMethods<T>, 'not' | 'eq'>
  : T;

type WhereFunction<T> = (builder: Transform<T>) => void;

type JsonValue = string | number | boolean | null;

type JsonArray = Array<Json>;

type JsonObject = {
  [key: string]: Json;
}

type JsonMap<T> = {
  [key: string]: T;
}

type Json = JsonValue | JsonObject | JsonArray;

type TableProperty = {
  [key: string]: TableProperty;
}

type TableObject<T> = {
  [key in keyof T]: TableProperty;
}

interface SqlQueryParams<P> {
  params: P;
}

type WhereField<T> = T | Array<NonNullable<T>> | WhereFunction<T>;

type OptionalToNull<T> = {
  [K in keyof T]-?: undefined extends T[K] ? Exclude<T[K], undefined> | null : T[K];
};

type ReplaceJson<T> =
  null extends T
    ? ReplaceJson<Exclude<T, null>> | null
    : JsonObject extends T
      ? string
      : [] extends T
        ? string
        : T;

type ToWhere<T> = {
  [K in keyof T]?: WhereField<ReplaceJson<T[K]>>;
} & {
  and?: Array<ToWhere<T>>;
  or?: Array<ToWhere<T>>;
};

interface QueryOptions {
  parse: boolean;
}

interface DatabaseConfig {
  debug?: boolean;
}

interface SQLiteConfig extends DatabaseConfig {
  db: string | URL;
  paths: SQLitePaths;
  adaptor: any;
}

interface TursoConfig extends DatabaseConfig {
  db: any;
  paths: Paths;
  adaptor: any;
}

interface FileSystem {
  readFile: (path: string, encoding: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  readdir: (path: string) => Promise<string[]>;
  join: (...paths: string[]) => string;
  readSql: (path: string) => Promise<string>;
}

interface Paths {
  tables: string | URL;
  views: string | URL;
  sql: string | URL;
  types: string | URL;
  migrations: string | URL;
}

interface SQLitePaths extends Paths {
  db: string | URL;
  extensions?: string | URL | Array<string | URL>;
}

declare class Database {
  constructor(options: DatabaseConfig);
  initialize(): Promise<void>;
  runMigration(sql: string): Promise<void>;
  makeTypes(fileSystem: FileSystem, paths: Paths, sampleData?: boolean): Promise<void>;
  getClient(): TypedDb;
  getTables(): Promise<string>;
  createMigration(fileSystem: FileSystem, paths: Paths, name: string, reset?: boolean): Promise<string>;
  run(args: { query: any, params?: any }): Promise<number>;
  all<T>(args: { query: any, params?: any, options?: QueryOptions }): Promise<Array<T>>;
  exec(query: string): Promise<void>;
  close(): Promise<void>;
}

declare class SQLiteDatabase extends Database {
  constructor(options: SQLiteConfig);
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

declare class TursoDatabase extends Database {
  constructor(options: TursoConfig);
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  batch(handler: (batcher: any) => any[]): Promise<any[]>;
}

type Unwrap<T extends any[]> = {
  [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K];
}

type WhereType = symbol | null | number | boolean | Date | WhereType[];

type JoinTuple = [symbol, symbol] | [symbol, symbol, 'left' | 'right'];

type QueryCompareTypes = Date | number | boolean | null | string | Buffer | symbol;

type SubqueryContext = 
  Tables &
  CompareMethods<QueryCompareTypes> &
  SymbolCompareMethods<QueryCompareTypes> &
  ComputeMethods &
  SymbolMethods &
  { use<T>(context: T): T }

type MakeOptional<T> = {
  [K in keyof T]: T[K] extends Array<infer U>
    ? Array<U | DbNull>
    : T[K] | DbNull;
};

interface QueryReturn {
  where?: any;
  join?: any;
  groupBy?: any;
  having?: any;
  orderBy?: any;
  desc?: any;
  offset?: any;
  limit?: any;
}

interface ObjectReturn<S> extends QueryReturn {
  select?: { [key: string | symbol]: S };
  distinct?: { [key: string | symbol]: S };
  optional?: { [key: string | symbol]: S };
}

interface TableReturn<S, D, O> extends QueryReturn {
  select?: ToDbInterface<S>;
  distinct?: ToDbInterface<D>;
  optional?: ToDbInterface<O>;
}

interface ValueReturn<S> extends QueryReturn {
  select?: S;
  distinct?: S;
  optional?: S;
}

type GetDefined<T> =
  (T extends { select: infer V }
    ? ToJsType<V> : never) |
  (T extends { distinct: infer V }
    ? ToJsType<V> : never) |
  (T extends { optional: infer V }
    ? V extends ToDbInterface<infer _>
      ? ToJsType<MakeOptional<NonNullable<V>>>
      : ToJsType<V> | null
    : never);

interface TypedDb {
  [key: string]: any;
  weightClasses: Queries<WeightClass, InsertWeightClass, ToWhere<WeightClass & unknown>, unknown, number, TypedDb>;
  locations: Queries<Location, InsertLocation, ToWhere<Location & unknown>, unknown, number, TypedDb> & LocationQueries;
  events: Queries<Event, InsertEvent, ToWhere<Event & unknown>, unknown, number, TypedDb> & EventQueries;
  cards: Queries<Card, InsertCard, ToWhere<Card & unknown>, unknown, number, TypedDb>;
  coaches: Queries<Coach, InsertCoach, ToWhere<Coach & unknown>, unknown, number, TypedDb> & CoachQueries;
  fighters: Queries<Fighter, InsertFighter, ToWhere<Fighter & ComputedFighter>, ComputedFighter, number, TypedDb> & FighterQueries;
  otherNames: Queries<OtherName, InsertOtherName, ToWhere<OtherName & unknown>, unknown, number, TypedDb>;
  fighterCoaches: Queries<FighterCoach, InsertFighterCoach, ToWhere<FighterCoach & unknown>, unknown, number, TypedDb>;
  rankings: Queries<Ranking, InsertRanking, ToWhere<Ranking & unknown>, unknown, number, TypedDb>;
  methods: Queries<Method, InsertMethod, ToWhere<Method & unknown>, unknown, number, TypedDb> & MethodQueries;
  fights: Queries<Fight, InsertFight, ToWhere<Fight & unknown>, unknown, number, TypedDb> & FightQueries;
  cancelledFights: Queries<CancelledFight, InsertCancelledFight, ToWhere<CancelledFight & unknown>, unknown, number, TypedDb>;
  titleRemovals: Queries<TitleRemoval, InsertTitleRemoval, ToWhere<TitleRemoval & unknown>, unknown, number, TypedDb>;
  fighterProfiles: VirtualQueries<FighterProfile, ToWhere<FighterProfile & unknown>>;
  opponents: Pick<Queries<Opponent, undefined, ToWhere<Opponent & unknown>, unknown, undefined, TypedDb>, 'get' | 'many' | 'query' | 'first' | 'groupBy' | 'count' | 'avg' | 'min' | 'max' | 'sum'>;
  exec(sql: string): Promise<void>;
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  pragma(sql: string): Promise<any[]>;
  deferForeignKeys(): Promise<void>;
  getTransaction(type?: ('read' | 'write' | 'deferred')): Promise<TypedDb>;
  batch:<T extends any[]> (batcher: (bx: TypedDb) => T) => Promise<Unwrap<T>>;
  sync(): Promise<void>;
  query<S extends SelectType, K extends ValueReturn<S>, T extends (context: SubqueryContext) => K>(expression: T): Promise<GetDefined<ReturnType<T>>[]>;
  query<S extends SelectType, K extends ObjectReturn<S>, T extends (context: SubqueryContext) => K>(expression: T): Promise<ToJsType<ReturnType<T>['select'] & ReturnType<T>['distinct'] & MakeOptional<NonNullable<ReturnType<T>['optional']>>>[]>;
  subquery<S extends SelectType, K extends ObjectReturn<S>, T extends (context: SubqueryContext) => K>(expression: T): ReturnType<T>['select'] & ReturnType<T>['distinct'] & MakeOptional<NonNullable<ReturnType<T>['optional']>>;
}

export const database: SQLiteDatabase;
export const db: TypedDb;
