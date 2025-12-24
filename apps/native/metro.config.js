const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

/** @type {import('expo/metro-config').MetroConfig} */

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Watch workspace root for changes (preserve default watchFolders)
config.watchFolders = [...(config.watchFolders || []), workspaceRoot]

// Resolve modules from workspace root node_modules
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules')
]

module.exports = config
