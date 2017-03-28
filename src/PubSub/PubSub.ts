/**
 * Created by flo on 23/03/2017.
 */
import {PubSubServer} from "./SubServer";
import {PubSubClient} from "./SubClient";
import {PubSubTag} from "./SubTag";

export type PubSubServerClass   = {new(...args : any[]): PubSubServer}
export type PubSubClientClass   = {new(...args : any[]): PubSubClient}
export type PubSubTagClass      = {new(...args : any[]): PubSubTag}

export interface PubSubLib {
    PubSubServer    : PubSubServerClass,
    PubSubClient    : PubSubClientClass,
    PubSubTag       : PubSubTagClass
}
exports.PubSubServer    = PubSubServer
exports.PubSubClient    = PubSubClient
exports.PubSubTag       = PubSubTag