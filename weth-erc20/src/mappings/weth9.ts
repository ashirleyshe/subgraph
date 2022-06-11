import { Address, log } from "@graphprotocol/graph-ts";

import {
	ERC20Deposit,
    ERC20Withdrawal,
} from '../../generated/schema'

import {
	Deposit,
    Withdrawal,
} from '../../generated/erc20-90-1/WETH9'

import {
	constants,
	decimals,
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../../node_modules/@openzeppelin/subgraphs/src/fetch/account'

import {
	fetchERC20,
	fetchERC20Balance,
	fetchERC20Approval,
} from '../../node_modules/@openzeppelin/subgraphs/src/fetch/erc20'

import { BIG_INT_ZERO } from "../constants"

export function handleDeposit(event: Deposit): void {
    log.info("[WETH] Log Deposit {} {} {}", [
        event.params.dst.toHex(),
        event.params.wad.toString(),
        event.block.number.toString(),
    ]);

    let contract   = fetchERC20(event.address)
    let ev = new ERC20Deposit(events.id(event))
	ev.emitter     = contract.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.contract    = contract.id
    ev.value       = decimals.toDecimals(event.params.wad, contract.decimals)
    ev.from        = event.params.dst

    let to                 = fetchAccount(event.params.dst)
    let balance            = fetchERC20Balance(contract, to)
    balance.valueExact     = balance.valueExact.plus(event.params.wad)
    balance.value          = decimals.toDecimals(balance.valueExact, contract.decimals)
    balance.save()

    ev.save()
}

export function handleWithdrawal(event: Withdrawal): void {
    log.info("[WETH] Log Deposit {} {} {}", [
        event.params.src.toHex(),
        event.params.wad.toString(),
        event.block.number.toString(),
    ]);

    let contract   = fetchERC20(event.address)
    let ev = new ERC20Deposit(events.id(event))
	ev.emitter     = contract.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.contract    = contract.id
    ev.value       = decimals.toDecimals(event.params.wad, contract.decimals)
    ev.from        = event.params.src

    let to                 = fetchAccount(event.params.src)
    let balance            = fetchERC20Balance(contract, to)
    balance.valueExact     = balance.valueExact.minus(event.params.wad)
    balance.value          = decimals.toDecimals(balance.valueExact, contract.decimals)
    balance.save()

    ev.save()
}