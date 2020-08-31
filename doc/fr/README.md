# ts-transform-test-compiler - API simple pour tester les transformateurs TypeScript

Ce paquet fourni une API simple pour faire quelques compilation _TypeScript_ basiques avec un transformateur donné. L'objectif de ce paquet n'est pas de faciliter l'utilisation de transformateurs, mais seulement d'être inclu dans une suite de test d'un transformateur. Pour des exemples d'utilisation, vous pouvez regarder :

- [ts-transform-asset](https://github.com/slune-org/ts-transform-asset)
- [ts-transform-auto-require](https://github.com/slune-org/ts-transform-auto-require)

# Langue

Les documents et messages, le code (y compris les noms de variable et commentaires), sont en anglais.

Cependant, Slune étant une entreprise française, tous les documents et messages importants doivent également être fournis en français. Les autres traductions sont bienvenues.

# Installation

L’installation se fait avec la commande `npm install` :

```bash
$ npm install --save-dev ts-transform-test-compiler
```

# Utilisation

La première chose à faire et de créer un objet de compilation. Cet objet pourra être partagé par toute la suite de tests car il ne contient que de la configuration statique.

Ensuite, utilisez l'objet de compilation pour lui paramétrer des options, si besoin, et finalement compiler les classes testées avec le transformateur.

```typescript
import Compiler from 'ts-transform-test-compiler'
import myTransform from '.'

describe('My test suite', function () {
  const compiler = new Compiler(myTransform, 'dist/__test__').setRootDir('__test__')

  it('should do what I expect', function () {
    const transformParams = { astring: 'hello', anumber: 12 }
    const result = compiler.setSourceFiles('test1/').compile('test1', transformParams)
    expect(result.succeeded).to.be.true
    expect(result.requireContent()).to.equal('Working!')
  })
})
```

# API

## Compiler

### constructor(transformer: Transformer, outDir: string, compilerOptions?: CompilerOptions)

Crée un objet de compilation pour le transformateur donné.

Le paramètre `outDir` est l'emplacement où les fichiers seront émis. Notez qu'en réalité, chaque compilation émet ses fichiers dans son propre répertoire, créé sous `outDir` et avec le nom du test en cours tel que fourni à la méthode `compile()`.

Les options de compilation sont optionnelles. Un ensemble de valeurs par défaut raisonnables sera utilisé si les options ne sont pas fournies. Les paramètres `rootDir` et `outDir` sont calculés à chaque compilation. Donner une valeur à ces paramètres dans les options est donc inutile.

### setTransformerHook(hook: keyof CustomTransformers): this

Appelez cette méthode pour indiquer le crochet à utiliser pour le transformateur (c'est-à-dire la phase à laquelle le transformateur est appelé). Si cette méthode n'est pas appelée, le crochet par défaut est `before`.

Cette méthode modifie l'objet de compilation. Vous pouvez l'appeler une seule fois (par exemple, à la création de l'objet de compilation) ou plusieurs fois (par exemple avant chaque test).

Cette méthode renvoie `this`, lui permettant d'être chainée.

### setSourceFiles(sourceFiles: string, ignoredFiles?: string | string\[]): this

Appelez cette méthode pour indiquer les fichiers à utiliser comme sources. Vous pouvez n'indiquer que les points d'entrée car le compilateur ira automatiquement rechercher les autres fichiers requis. Tous les fichiers fournis doivent se trouver dans la racine du projet, qui est le répertoire courant par défaut.

Le paramètre `sourceFiles` peut soit être un répertoire (terminé par `/` et ne contenant pas de caractère _magique_ de [glob](https://www.npmjs.com/package/glob)) ou un patron au format _glob_. S'il s'agit d'un répertoire, `**/*.ts` sera ajouté. Dans tous les cas, la valeur de `sourceFiles` sera préfixée par la racine du projet. La valeur par défaut est `/`, ce qui prendra tous les fichiers `.ts` contenu sous la racine du projet.

Si le patron _glob_ fourni englobe des fichiers non souhaités, vous pouvez les supprimer avec le paramètre `ignoredFiles`. La valeur indiquée ici sera directement fournie à l'option `ignore` de [glob](https://www.npmjs.com/package/glob).

Cette méthode modifie l'objet de compilation. Vous pouvez l'appeler une seule fois (par exemple, à la création de l'objet de compilation) ou plusieurs fois (par exemple avant chaque test).

Cette méthode renvoie `this`, lui permettant d'être chainée.

### setRootDir(rootDir: string | undefined): this

Indique (ou supprime, si aucun paramètre n'est fourni) la racine du projet. Si le répertoire racine n'est pas indiqué, le compilateur utilisera le répertoire courant.

Cette méthode modifie l'objet de compilation. Vous pouvez l'appeler une seule fois (par exemple, à la création de l'objet de compilation) ou plusieurs fois (par exemple avant chaque test).

Cette méthode renvoie `this`, lui permettant d'être chainée.

### clearGlobCaches(): this

Cette méthode vide les caches utilisés par [glob](https://www.npmjs.com/package/glob) pour rechercher les fichiers d'entrée. Vous ne devriez l'utiliser que si vous avez des problèmes.

Cette méthode renvoie `this`, lui permettant d'être chainée.

### compile(name: string, configuration: any): CompilationResult

Compile les fichiers en utilisant le transformateur. Le `name` sera utilisé pour créer un sous-répertoire sous `outDir` pour y émettre les fichiers. Cela évitera que tous les tests émettent leurs fichiers au même endroit. Vous pouvez, bien sûr, donner le même nom à plusieurs tests, même si ce n'est pas recommandé.

Le paramètre `configuration` contient la configuration a donner au transformateur.

La compilation renvoie un objet résultat.

## CompilationResult

### succeeded: boolean

Indique si la compilation a réussi, c'est-à-dire s'est déroulée sans erreur.

### print(): void

Affiche les messages de diagnostique sur la sortie standard.

### requireContent(file?: string, variable?: string): any

Requiert le contenu d'un fichier compilé.

Si `file` n'est pas spécifié, la méthode va directement requérir le répertoire de sortie, il devrait donc s'y trouver un fichier d'index.

Si `variable` est spécifié, alors la méthode va renvoyer le contenu de cette variable exportée plutôt que l'export par défaut.

## defaultTsConfig

La configuration par défaut utilisée par le compilateur est exportée en tant qu'objet immutable nomé `defaultTsConfig` afin que vous puissiez la surcharger plutôt que de le ré-écrire complètement.

# Contribuer

Bien que nous ne puissions pas garantir un temps de réponse, n’hésitez pas à ouvrir un incident si vous avez une question ou un problème pour utiliser ce paquet.

Les _Pull Requests_ sont bienvenues. Vous pouvez bien sûr soumettre des corrections ou améliorations de code, mais n’hésitez pas également à améliorer la documentation, même pour de petites fautes d’orthographe ou de grammaire.
