import { RpgPlugin, HookServer, HookClient } from './Plugin'
import { isArray, isClass, isFunction, isPromise } from './Utils'
import { warning } from './Logger'

enum Side {
    Server = 'server',
    Client = 'client'
}

type ModuleSide = {
    client?: any,
    server?: any
}

export type ModuleType = ModuleSide | [ModuleSide, {
    client?: any,
    server?: any
}]

export function RpgModule<T>(options: T) {
    return (target) => {
        for (let key in options) {
            target.prototype[key] = options[key]
        }
    }
}

export async function loadModules(modules, obj, middleware?: Function): Promise<{ playerProps: any }> {
    const { side, relations } = obj
    let playerProps = {}
    for (let module of modules) {
        if (!module) continue
        let plug: any = []
        if (!isArray(module)) {
            plug = [module]
        }
        else {
            plug = module
        }
        const [moduleClassSides, options] = plug
        const moduleClass = moduleClassSides[side]
        if (!moduleClass) continue
        let mod
        if (options && side == Side.Client && options[Side.Server]) {
            warning(`Data that may be sensitive (normally visible only on the server side) are made optional and visible on the client side.\nInstead, import the configuration with the server! flag into an import. Example: \n\nimport config from 'server!./config\n\n'`, options[Side.Server])
        }
        if (options && !isClass(moduleClass) && isFunction(moduleClass)) {
            mod = new (moduleClass(options[side]))()
        }
        else if (isClass(moduleClass)) {
            mod = new moduleClass()
        }
        else {
            mod = moduleClass
        }
        if (middleware) {
            mod = middleware(mod)
            if (isPromise(mod)) {
                mod = await mod
            }
        }
        const { imports, maps, spritesheets, sounds, gui, scenes, engine, database, worldMaps, scalability, events } = mod
        if (imports) {
            await loadModules(imports, obj)
        }
        if (maps) {
            RpgPlugin.on(HookServer.AddMap, () => maps)
        }
        if (events) {
            RpgPlugin.on(HookServer.AddEvent, () => events)
        }
        if (worldMaps) {
            RpgPlugin.on(HookServer.AddWorldMaps, () => worldMaps)
        }
        if (database) {
            RpgPlugin.on(HookServer.AddDatabase, () => database)
        }
        if (spritesheets) {
            RpgPlugin.on(HookClient.AddSpriteSheet, () => spritesheets)
        }
        if (sounds) {
            RpgPlugin.on(HookClient.AddSound, () => sounds)
        }
        if (gui) {
            RpgPlugin.on(HookClient.AddGui, () => gui)
        }
        const player = side == Side.Server ? mod.player : mod.sprite
        const loadRelations = (hook, relatioName) => {
            if (hook) {
                for (let method in relations[relatioName]) {
                    const hookName = relations[relatioName][method]
                    if (hook[method]) RpgPlugin.on(hookName, hook[method])
                }
            }
        }
        loadRelations(player, 'player')
        if (player && player.props) {
            playerProps = Object.assign(playerProps, player.props)
        }
        loadRelations(engine, 'engine')
        if (scalability) loadRelations(scalability._hooks, 'scalability')
        if (scenes) loadRelations(scenes.map, 'sceneMap')
    }

    return {
        playerProps
    }
}