import {EventEmitter} from 'events'
import {ArgumentParser} from 'argparse'
import Roots from '../'
import pkg from '../../package.json'

export default class CLI extends EventEmitter {
  constructor (opts = {}) {
    super()

    this.parser = new ArgumentParser({
      version: pkg.version,
      description: pkg.description,
      addHelp: true
    })

    this.sub = this.parser.addSubparsers()

    this.addCompile()
  }

  run (args) {
    if (typeof args === 'string') { args = args.split(' ') }
    args = this.parser.parseArgs(args)

    let fn = require(`./${args.fn}`).default
    delete args.fn

    let project

    try {
      project = new Roots({ root: args.path })
    } catch (err) {
      return this.emit('error', err)
    }

    project.on('error', this.emit.bind(this, 'error'))
    project.on('warning', this.emit.bind(this, 'warning'))
    project.on('compile', this.emit.bind(this, 'compile'))

    fn(project)

    return this
  }

  addCompile () {
    let s = this.sub.addParser('compile', { help: 'Compile a roots project' })

    s.addArgument(['path'], {
      nargs: '?',
      defaultValue: process.cwd(),
      help: 'Path to a project that you would like to compile'
    })

    s.setDefaults({ fn: 'compile' })
  }
}
