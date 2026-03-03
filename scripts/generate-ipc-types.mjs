import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync } from 'node:fs'
import ts from 'typescript'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const tsconfigPath = join(projectRoot, 'tsconfig.node.json')
const outputPath = join(projectRoot, 'types', 'ipc-methods.d.ts')

const normalizePath = (value) => value.replace(/\\/g, '/').toLowerCase()

function getNodeDecorators(node) {
    const byApi = ts.canHaveDecorators(node) ? ts.getDecorators(node) : undefined
    if (byApi?.length) return byApi

    if (!('modifiers' in node) || !node.modifiers) return []
    return node.modifiers.filter((m) => m.kind === ts.SyntaxKind.Decorator)
}

function getDecoratorName(decorator) {
    const expr = decorator.expression
    if (!ts.isCallExpression(expr)) return undefined
    if (ts.isIdentifier(expr.expression)) return expr.expression.text
    if (ts.isPropertyAccessExpression(expr.expression) && ts.isIdentifier(expr.expression.name)) {
        return expr.expression.name.text
    }
    return undefined
}

function getIpcChannel(method) {
    const decorators = getNodeDecorators(method)
    if (!decorators?.length) return undefined

    for (const decorator of decorators) {
        const expr = decorator.expression
        if (!ts.isCallExpression(expr)) continue
        const name = getDecoratorName(decorator)
        if (name !== 'IpcHandle') continue

        const channelArg = expr.arguments[0]
        if (ts.isStringLiteral(channelArg) || ts.isNoSubstitutionTemplateLiteral(channelArg)) {
            return channelArg.text
        }
    }

    return undefined
}

function hasDecorator(param, targetDecoratorName) {
    const decorators = getNodeDecorators(param)
    if (!decorators?.length) return false
    return decorators.some((d) => getDecoratorName(d) === targetDecoratorName)
}

function unwrapAsyncOrObservable(type, checker) {
    let current = type

    for (let depth = 0; depth < 8; depth++) {
        const symbol = current.aliasSymbol ?? current.getSymbol()
        const symbolName = symbol?.getName()

        if (!symbolName) break

        if ((symbolName === 'Promise' || symbolName === 'Observable') && current.aliasTypeArguments?.[0]) {
            current = current.aliasTypeArguments[0]
            continue
        }

        if ((symbolName === 'Promise' || symbolName === 'Observable') && checker.isArrayType(current) === false) {
            const ref = current
            if ('typeArguments' in ref && Array.isArray(ref.typeArguments) && ref.typeArguments[0]) {
                current = ref.typeArguments[0]
                continue
            }
        }

        break
    }

    return current
}

const configResult = ts.readConfigFile(tsconfigPath, ts.sys.readFile)
if (configResult.error) {
    throw new Error(ts.flattenDiagnosticMessageText(configResult.error.messageText, '\n'))
}

const parsed = ts.parseJsonConfigFileContent(configResult.config, ts.sys, projectRoot)
const program = ts.createProgram({
    rootNames: parsed.fileNames,
    options: parsed.options,
})
const checker = program.getTypeChecker()

const records = new Map()
const srcMainPathFragment = '/src/main/'
const ormImportedTypeNames = new Set()
const usedOrmTypeNames = new Set()

function collectOrmImportedTypes(sourceFile) {
    sourceFile.forEachChild((node) => {
        if (!ts.isImportDeclaration(node)) return
        if (!ts.isStringLiteral(node.moduleSpecifier)) return

        const modulePath = node.moduleSpecifier.text
        if (!modulePath.includes('orm_types')) return

        const namedBindings = node.importClause?.namedBindings
        if (!namedBindings || !ts.isNamedImports(namedBindings)) return

        for (const element of namedBindings.elements) {
            ormImportedTypeNames.add(element.name.text)
        }
    })
}

function markUsedOrmTypes(typeText) {
    for (const typeName of ormImportedTypeNames) {
        const reg = new RegExp(`\\b${typeName}\\b`)
        if (reg.test(typeText)) {
            usedOrmTypeNames.add(typeName)
        }
    }
}

for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile) continue
    const normalizedFileName = normalizePath(sourceFile.fileName)
    if (!normalizedFileName.includes(srcMainPathFragment)) continue
    if (!normalizedFileName.includes('.controller')) continue

    collectOrmImportedTypes(sourceFile)

    ts.forEachChild(sourceFile, function visit(node) {
        if (ts.isClassDeclaration(node)) {
            for (const member of node.members) {
                if (!ts.isMethodDeclaration(member)) continue
                const channel = getIpcChannel(member)
                if (!channel) continue

                const signature = checker.getSignatureFromDeclaration(member)
                if (!signature) continue

                const callParams = member.parameters.filter((p) => !hasDecorator(p, 'Ctx'))

                const params = callParams.map((param, index) => {
                    const paramType = checker.getTypeAtLocation(param)
                    const typeText = checker.typeToString(
                        paramType,
                        undefined,
                        ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
                    )

                    const nameText = ts.isIdentifier(param.name) ? param.name.text : `arg${index}`
                    markUsedOrmTypes(typeText)
                    return `${nameText}: ${typeText}`
                })

                const returnType = unwrapAsyncOrObservable(signature.getReturnType(), checker)
                const returnTypeText = checker.typeToString(
                    returnType,
                    undefined,
                    ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
                )
                markUsedOrmTypes(returnTypeText)

                records.set(channel, { channel, params, returnTypeText })
            }
        }

        ts.forEachChild(node, visit)
    })
}

const sortedRecords = [...records.values()].sort((a, b) => a.channel.localeCompare(b.channel))

const lines = []
lines.push('/* eslint-disable */')
lines.push('// Generated by scripts/generate-ipc-types.mjs. DO NOT EDIT.')
lines.push('')
if (usedOrmTypeNames.size > 0) {
    const names = [...usedOrmTypeNames].sort((a, b) => a.localeCompare(b))
    lines.push(`import type { ${names.join(', ')} } from './orm_types'`)
    lines.push('')
}
lines.push('export interface IpcInvokeMap {')
if (sortedRecords.length === 0) {
    lines.push('}')
}
else {
    for (const item of sortedRecords) {
        lines.push(`  '${item.channel}': {`)
        lines.push(`    params: [${item.params.join(', ')}]`)
        lines.push(`    return: ${item.returnTypeText}`)
        lines.push('  }')
    }
    lines.push('}')
}
lines.push('')
lines.push('export type IpcChannel = keyof IpcInvokeMap')
lines.push('')
lines.push('export type IpcInvokeArgs<T extends IpcChannel> = IpcInvokeMap[T][\'params\']')
lines.push('export type IpcInvokeReturn<T extends IpcChannel> = Promise<IpcInvokeMap[T][\'return\']>')
lines.push('')
lines.push('export {}')
lines.push('')

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, lines.join('\n'), 'utf8')

console.log(`Generated IPC types: ${outputPath}`)
