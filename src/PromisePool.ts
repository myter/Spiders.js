/**
 * Created by flo on 22/12/2016.
 */

export class PromiseAllocation {
    promise     : Promise<any>;
    promiseId   : number;
    constructor(promise: Promise<any>,promiseId : number){
        this.promise    = promise
        this.promiseId  = promiseId
    }
}

export class ForeignPromiseAllocation extends PromiseAllocation{
    promiseOwnerId : string
    constructor(promise : Promise<any>,promiseId : number,promiseOwnerId : string){
        super(promise,promiseId)
        this.promiseOwnerId = promiseOwnerId
    }
}

export class PromisePool{
    private ids             = 0
    private promises        = new Map()
    private foreignPromises = new Map()

    newPromise() : PromiseAllocation {
        var res
        var rej
        var promId = this.ids
        var prom = new Promise((resolve,reject) => {
            res = resolve
            rej = reject
        })
        this.promises.set(this.ids,[res,rej])
        this.ids += 1
        return new PromiseAllocation(prom,promId)
    }

    private applyForPromise(promiseId : number,arg : any,funcIndex : number){
        this.promises.get(promiseId)[funcIndex](arg)
    }

    resolvePromise(promiseId : number,value : any){
        this.applyForPromise(promiseId,value,0)
    }

    rejectPromise(promiseId : number,reason : any){
        this.applyForPromise(promiseId,reason,1)
    }

    newForeignPromise(promiseId : number,promiseOwnerId : string) : Promise<any>{
        var existing    = []
        if(this.foreignPromises.has(promiseOwnerId)){
            existing = this.foreignPromises.get(promiseOwnerId)
        }
        var prom        = new Promise((resolve,reject) => {
            var alloc = new ForeignPromiseAllocation(prom,promiseId,promiseOwnerId)
            existing.push([alloc,resolve,reject])
            this.foreignPromises.set(promiseOwnerId,existing)
        })
        return prom
    }

    private applyForForeignPromise(promiseId : number,promiseOwnerId : string,arg : any,funcIndex : number){
        var promises = this.foreignPromises.get(promiseOwnerId)
        promises.forEach((alloc) => {
            var foreignAlloc : ForeignPromiseAllocation = alloc[0]
            if(foreignAlloc.promiseId == promiseId){
                alloc[funcIndex](arg)
            }
        })
    }

    resolveForeignPromise(promiseId : number,promiseOwnerId : string,value : any){
        this.applyForForeignPromise(promiseId,promiseOwnerId,value,1)
    }

    rejectForeignPromise(promiseId : number,promiseOwnerId : string,reason : any){
        this.applyForForeignPromise(promiseId,promiseOwnerId,reason,2)
    }
}
