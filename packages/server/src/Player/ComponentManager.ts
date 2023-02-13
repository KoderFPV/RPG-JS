import { Utils } from '@rpgjs/common'
import { BarComponentObject, ComponentObject, LayoutObject, LayoutOptions, TextComponentObject, LayoutPositionEnum } from '@rpgjs/types'

const defaultStyle = (style: any) => ({
    borderColor: '#000000',
    borderWidth: 2,
    bgColor: '#000000',
    borderRadius: 5,
    ...style
})

const bar = (current: string, max: string, style?: BarComponentObject['value']['style']): BarComponentObject => {
    return {
        id: 'bar',
        value: {
            current,
            max,
            style
        }
    }
}

export const Component = {
    hpBar(style?: BarComponentObject['value']['style']): BarComponentObject {
        return bar('hp', 'param.maxHp', {
            ...defaultStyle({
                fillColor: '#00ff00'
            }),
            ...((style as any) || {})
        })
    },
    spBar(style?: BarComponentObject['value']['style']): BarComponentObject {
        return bar('sp', 'param.maxSp', {
            ...defaultStyle({
                fillColor: '#0000ff'
            }),
            ...((style as any) || {})
        })
    },
    text(value: string, style?: TextComponentObject['value']): TextComponentObject {
        return {
            id: 'text',
            value: {
                text: value,
                style: {
                    fill: '#ffffff',
                    fontSize: 15,
                    ...((style as any) || {})
                }
            }
        }
    }
}

export class ComponentManager {
    layout: LayoutObject<any>

    /**
     * Give the spritesheet identifier
     * 
     * Since version 3.0.0-rc, you can define several graphic elements. If you put a number, it represents the tile ID in the tileset
     * 
     * Example 1:
     * ```ts
     * player.setGraphic(['body', 'shield'])
     * ```
     * 
     * Example 2:
     * ```ts
     * player.setGraphic(3) // Use tile #3
     * ```
     * 
     * > You must, on the client side, create the spritesheet in question. Guide: [Create Sprite](/guide/create-sprite.html)
     * 
     * @title Set Graphic
     * @method player.setGraphic(graphic)
     * @param {string | number | (string | number)[]} graphic
     * @returns {void}
     * @memberof Player
     */
    setGraphic(graphic: string | number | (string | number)[]) {
        const components = (Utils.isArray(graphic) ? graphic : [graphic]) as string[]
        const col = components.map(value => ({ id: Utils.isString(value) ? 'graphic' : 'tile', value }))
        this.setComponentsCenter(col)
    }

    private setComponents<P extends LayoutPositionEnum, T = any>(position: P, layout: ComponentObject<T>[][] | ComponentObject<T>[], options: LayoutOptions = {}) {
        this.layout[position] = {
            lines: layout.map(col => {
                if (!Utils.isArray(col)) {
                    col = [col]
                }
                return { col }
            }),
            ...options
        }
    }

    setComponentsCenter<T = any>(layout: ComponentObject<T>[][], options?: LayoutOptions)
    setComponentsCenter<T = any>(layout: ComponentObject<T>[], options?: LayoutOptions)
    setComponentsCenter<T = any>(layout: ComponentObject<T>[][] | ComponentObject<T>[], options: LayoutOptions = {}) {
        this.setComponents<'center', T>('center', layout, options)
    }

    setComponentsTop<T = any>(layout: ComponentObject<T>[][], options?: LayoutOptions)
    setComponentsTop<T = any>(layout: ComponentObject<T>[], options?: LayoutOptions)
    setComponentsTop<T = any>(layout: ComponentObject<T>[][] | ComponentObject<T>[], options: LayoutOptions = {}) {
        this.setComponents<'top', T>('top', layout, options)
    }

    setComponentsBottom<T = any>(layout: ComponentObject<T>[][], options?: LayoutOptions)
    setComponentsBottom<T = any>(layout: ComponentObject<T>[], options?: LayoutOptions)
    setComponentsBottom<T = any>(layout: ComponentObject<T>[][] | ComponentObject<T>[], options: LayoutOptions = {}) {
        this.setComponents<'bottom', T>('bottom', layout, options)
    }

    setComponentsLeft<T = any>(layout: ComponentObject<T>[][], options?: LayoutOptions)
    setComponentsLeft<T = any>(layout: ComponentObject<T>[], options?: LayoutOptions)
    setComponentsLeft<T = any>(layout: ComponentObject<T>[][] | ComponentObject<T>[], options: LayoutOptions = {}) {
        this.setComponents<'left', T>('left', layout, options)
    }

    setComponentsRight<T = any>(layout: ComponentObject<T>[][], options?: LayoutOptions)
    setComponentsRight<T = any>(layout: ComponentObject<T>[], options?: LayoutOptions)
    setComponentsRight<T = any>(layout: ComponentObject<T>[][] | ComponentObject<T>[], options: LayoutOptions = {}) {
        this.setComponents<'right', T>('right', layout, options)
    }
}