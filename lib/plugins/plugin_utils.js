import glob from 'glob'
import path from 'path'
import micromatch from 'micromatch'
import SingleEntryDependency from 'webpack/lib/dependencies/SingleEntryDependency'

export default {
  getFilesFromGlob (compiler, opts) {
    let matcher = path.join(compiler.options.context, opts.matcher)
    return glob.sync(matcher)
                    // .filter(removeIgnores.bind(null, opts.ignore))
  },
  addFilesAsWebpackEntries (files, opts, compiler, compilation) {
    let tasks = []
    files.forEach(f => {
      let matchedFile = micromatch(f, opts.matcher)
      let name = path.basename(matchedFile, path.extname(opts.matcher))

      let relativePath = f.replace(compiler.options.context, '.')
      let dep = new SingleEntryDependency(relativePath)

      tasks.push(new Promise((resolve, reject) => {
        compilation.addEntry(compiler.options.context, dep, name, (err) => {
          if (err) { reject(err) } else { resolve(true) }
        })
      }))
    })

    return Promise.all(tasks)
  },
  getOutputPath (compiler, f, opts) {
    let rel = f.replace(compiler.options.context, '')

    opts.dumpDirs.forEach(d => {
      let re = new RegExp(`^${path.sep}${d}`)
      if (rel.match(re)) { rel = rel.replace(`${path.sep}${d}`, '') }
    })

    return rel.substring(1)
  }
}

// utils
// TODO: add back removeIgnores once css loader logic is working properly
// function removeIgnores (ignores, f) {
//   for (let ignore of ignores) {
//     if (f.match(ignore)) { return false }
//   }
//   return true
// }
