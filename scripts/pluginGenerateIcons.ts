import fs from 'fs-extra'
import * as path from 'node:path'
import process from "node:process";
import { Api } from '@vitejs/plugin-vue'
import { Plugin } from 'vite'
import { snakeCase } from "es-toolkit";

const iconsDir = path.join(process.cwd(), './src/assets/svg')

function exist(path: string) {
    return fs.existsSync(path)
}

function parseComponentsDeclaration(code: string) {
    if (!code) return {}

    return Object.fromEntries(
        Array.from(code.matchAll(/(?<!\/\/)\s+\s+['"]?(.+?)['"]?:\s(.+?)\n/g)).map(
            i => [i[1], i[2]]
        )
    )
}

/** Генерирует иконки и завершает процесс. */
export default function generateIcons(): Plugin<Api> {
    return {
        name: 'run-icons-script',
        apply: 'build',
        async buildStart() {
            if (process.env.GENERATE_ICONS !== 'true') {
                return
            }

            console.log('Старт генерации иконок...')
            const globalComponents: Record<string, string> = {}
            const iconsComponentsIndexPath = path.join(process.cwd(), './src/index.ts')
            const iconSizes = (await fs.readdir(iconsDir, {withFileTypes: true})).filter(x => x.isDirectory()).map(x => x.name)
            // index.ts
            let imports = ''
            let exports = ''

            for (const size of iconSizes) {
                const iconsDirFromSize = path.join(iconsDir, size)
                const iconFiles = fs.readdirSync(iconsDirFromSize).filter((file) => file.endsWith('.svg'))

                for (const file of iconFiles) {
                    const iconName = file.replace('.svg', '')
                    const componentName = transformIconName(iconName.slice(0, iconName.length - size.length), size)
                    const importPath = `./assets/svg/${size}/${file}?component`
                    imports += `import ${componentName} from '${importPath}';\n`
                    exports += `  ${componentName},\n`
                    globalComponents[componentName] = size
                }

                imports += '\n'
                exports += '\n'
            }


            const content = `// Auto generated component declarations
${imports}
export {
${exports}
};`

            // Записываем содержимое в файл index.ts
            fs.writeFileSync(iconsComponentsIndexPath, content, 'utf8')

            console.log('Компоненты успешно созданы.')

            console.log('Старт генерации web-types...')

            const version = process.env.npm_package_version || '0.0.0'

            const scaffold = {
                $schema: 'https://raw.githubusercontent.com/JetBrains/web-types/master/schema/web-types.json',
                framework: 'vue',
                name: 'vue-vkontakte-icons',
                version,
                'js-types-syntax': 'typescript',
                "framework-config": {
                    "enable-when": {
                        "node-packages": [
                            "vue",
                            "@vue/cli"
                        ],
                        "file-extensions": [
                            "vue"
                        ],
                        "ide-libraries": [
                            "vue"
                        ]
                    }
                },
                contributions: {
                    html: {
                        'vue-components': [] as any[]
                    }
                }
            }

            Object.entries(globalComponents).forEach(([exportName]) => {
                if (!exportName.startsWith('Icon')) return

                const size = globalComponents[exportName]
                const name = snakeCase(exportName.slice(6))
                scaffold.contributions.html['vue-components'].push({
                    name: exportName,
                    description: 'Automatically generated component',
                    'doc-url': `https://vkcom.github.io/icons/#${size}/${name}`,
                    source: {
                        symbol: exportName
                    },
                    props: [],
                    js: {
                        events: []
                    },
                    slots: []
                })
            })

            await fs.writeFile(
                path.resolve(process.cwd(), 'web-types.json'),
                JSON.stringify(scaffold, null, 2)
            )

            console.log('Web-types успешно сгенерированы')

            const components: Record<string, any> = {}
            Object.keys(globalComponents).forEach((key) => {
                const entry = `import('vue').DefineComponent`
                if (key.startsWith('Icon')) {
                    components[key] = entry
                }
            })
            const originalContent = exist(path.resolve(process.cwd(), 'volar.d.ts'))
                ? await fs.readFile(path.resolve(process.cwd(), 'volar.d.ts'), 'utf-8')
                : ''

            const originImports = parseComponentsDeclaration(originalContent)

            const lines = Object.entries({
                ...originImports,
                ...components
            })
                .filter(([name]) => {
                    return components[name]
                })
                .map(([name, v]) => {
                    if (!/^\w+$/.test(name)) {
                        name = `'${name}'`
                    }
                    return `${name}: ${v}`
                })

            const code = `// Auto generated component declarations
declare module 'vue' {
  export interface GlobalComponents {
    ${lines.join('\n    ')}
  }
}
export {}
`

            if (code !== originalContent) {
                await fs.writeFile(path.resolve(process.cwd(), 'volar.d.ts'), code, 'utf-8')
            }

            console.log('Генерация типов успешно завершена')

            process.exit(0)
        },
    }
}


// 18_circle_outline_32.svg -> Icon3218CircleOutline
function transformIconName(iconName: string, size: string) {
    const parts = iconName.split('_')
    const formattedName = parts.map(part =>
        part.charAt(0).toUpperCase() + part.slice(1)
    ).join('');
    return `Icon${size}${formattedName}`;
}
