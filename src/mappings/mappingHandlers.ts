// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { AvalancheBlockEntity, AvalancheEventEntity, AvalancheTransactionEntity } from "../types";
// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {ApiPromise} from '@polkadot/api';
import {RegistryTypes} from '@polkadot/types/types';


export enum SubqlHandlerKind {
  Block = 'BlockHandler',
  Call = 'CallHandler',
  Event = 'EventHandler',
}
export type SpecVersionRange = [number, number];

interface SubqlBaseHandlerFilter {
  specVersion?: SpecVersionRange;
}

export type SubqlBlockFilter = SubqlBaseHandlerFilter;

export interface SubqlEventFilter extends SubqlBaseHandlerFilter {
  module?: string;
  method?: string;
}

export interface SubqlCallFilter extends SubqlEventFilter {
  success?: boolean;
  from?: string;
  to?: string;
}


// TODO: those 3 types are duplicate from subql/types
// We have to find a way to import them from our version of the package

import {Extrinsic, EventRecord, SignedBlock} from '@polkadot/types/interfaces';

export interface SubstrateBlock extends SignedBlock {
  // parent block's spec version, can be used to decide the correct metadata that should be used for this block.
  specVersion: number;
  timestamp: Date;
  events: EventRecord[];
}

export interface SubstrateExtrinsic {
  // index in the block
  idx: number;
  extrinsic: Extrinsic;
  block: SubstrateBlock;
  events: EventRecord[];
  success: boolean;
}

export interface SubstrateEvent extends EventRecord {
  // index in the block
  idx: number;
  extrinsic?: SubstrateExtrinsic;
  block: SubstrateBlock;
}

export interface AvalancheCallFilter {
  from?: string;
  to?: string;
  function?: string;
}

export interface AvalancheEventFilter {
  address?: string;
  topics?: Array<string | null | undefined>;
}

export type AlgorandBlock = Record<string, any>;
export type AlgorandTransaction = Record<string, any>; // TODO
export type AlgorandEvent = Record<string, any>; // TODO

export type AvalancheBlock = {
  difficulty: string;
  extraData: string;
  gasLimit: string;
  gasUsed: string;
  hash: string;
  logsBloom: string;
  miner: string;
  mixHash: string;
  nonce: string;
  number: string;
  parentHash: string;
  receiptsRoot: string;
  sha3Uncles: string;
  size: string;
  stateRoot: string;
  timestamp: string;
  totalDifficulty: string;
  transactions: AvalancheTransaction[];
  transactionsRoot: string;
  uncles: string[];
};

export type AvalancheTransaction = {
  blockHash: string;
  blockNumber: string;
  from: string;
  gas: string;
  gasPrice: string;
  hash: string;
  input: string;
  nonce: string;
  to: string;
  transactionIndex: string;
  value: string;
  v: string;
  r: string;
  s: string;
};

export type AvalancheEvent = {
  logIndex: string;
  blockNumber: string;
  blockHash: string;
  transactionHash: string;
  transactionIndex: string;
  address: string;
  data: string;
  topics: string[];
};

export interface BlockWrapper<
  B extends SubstrateBlock | AlgorandBlock | AvalancheBlock = SubstrateBlock | AlgorandBlock | AvalancheBlock,
  C extends SubstrateExtrinsic | AlgorandTransaction | AvalancheTransaction =
    | SubstrateExtrinsic
    | AlgorandTransaction
    | AvalancheTransaction,
  E extends SubstrateEvent | AlgorandEvent | AvalancheEvent = SubstrateEvent | AlgorandEvent | AvalancheEvent,
  CF extends SubqlCallFilter | AvalancheCallFilter = SubqlCallFilter | AvalancheCallFilter,
  EF extends SubqlEventFilter | AvalancheEventFilter = SubqlEventFilter | AvalancheEventFilter
> {
  block: B;
  blockHeight: number;
  specVersion?: number;
  hash: string;
  calls?: (filters?: CF | CF[]) => C[];
  events?: (filters?: EF | EF[]) => E[];
}

export interface AvalancheBlockWrapper
  extends BlockWrapper<
    AvalancheBlock,
    AvalancheTransaction,
    AvalancheEvent,
    AvalancheCallFilter,
    AvalancheEventFilter
  > {
  get: (objects: string[]) => Record<string, any>;
  getTransactions: (filters?: string[]) => Record<string, any>;
}

export async function handleBlock(block: BlockWrapper): Promise<void> {
  let avalancheBlock: AvalancheBlock = block.block as AvalancheBlock;
  const blockRecord = new AvalancheBlockEntity(avalancheBlock.hash);

  blockRecord.difficulty = avalancheBlock.difficulty;
  blockRecord.extraData = avalancheBlock.extraData;
  blockRecord.gasLimit = avalancheBlock.gasLimit;
  blockRecord.gasUsed = avalancheBlock.gasUsed;
  blockRecord.hash = avalancheBlock.hash;
  blockRecord.logsBloom = avalancheBlock.logsBloom;
  blockRecord.miner = avalancheBlock.miner;
  blockRecord.mixHash = avalancheBlock.mixHash;
  blockRecord.nonce = avalancheBlock.nonce;
  blockRecord.number = avalancheBlock.number;
  blockRecord.parentHash = avalancheBlock.parentHash;
  blockRecord.receiptsRoot = avalancheBlock.receiptsRoot;
  blockRecord.sha3Uncles = avalancheBlock.sha3Uncles;
  blockRecord.size = avalancheBlock.size;
  blockRecord.stateRoot = avalancheBlock.stateRoot;
  blockRecord.timestamp = avalancheBlock.timestamp;
  blockRecord.totalDifficulty = avalancheBlock.totalDifficulty;
  blockRecord.transactionsRoot = avalancheBlock.transactionsRoot;
  blockRecord.uncles = avalancheBlock.uncles;

  await blockRecord.save();
}

export async function handleCall(transaction: AvalancheTransaction): Promise<void> {
  const transactionRecord = new AvalancheTransactionEntity(`${transaction.blockHash}-${transaction.hash}`)

  transactionRecord.blockId = transaction.blockHash
  transactionRecord.blockHash = transaction.blockHash;
  transactionRecord.blockNumber = transaction.blockNumber;
  transactionRecord.from = transaction.from;
  transactionRecord.gas = transaction.gas;
  transactionRecord.gasPrice = transaction.gasPrice;
  transactionRecord.hash = transaction.hash;
  transactionRecord.input = transaction.input;
  transactionRecord.nonce = transaction.nonce;
  transactionRecord.r = transaction.r;
  transactionRecord.s = transaction.s;
  transactionRecord.to = transaction.to;
  transactionRecord.transactionIndex = transaction.transactionIndex;
  transactionRecord.v = transaction.v;
  transactionRecord.value = transaction.value;

  await transactionRecord.save();
}

export async function handleEvent(event: AvalancheEvent): Promise<void> {
  const eventRecord = new AvalancheEventEntity(`${event.blockHash}-${event.logIndex}`);

  eventRecord.address = event.address
  eventRecord.blockHash = event.blockHash
  eventRecord.blockId = event.blockHash
  eventRecord.blockNumber = event.blockNumber
  eventRecord.data = event.data
  eventRecord.logIndex = event.logIndex
  eventRecord.topics = event.topics
  eventRecord.transactionHash = event.transactionHash
  eventRecord.transactionIndex = event.transactionIndex

  await eventRecord.save()
}