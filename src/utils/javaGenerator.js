/**
 * Java source code generator from UML class diagram data
 */

const VISIBILITY_MAP = {
  '+': 'public',
  '-': 'private',
  '#': 'protected',
  '~': '', // package-private
};

function visibilityKeyword(v) {
  return VISIBILITY_MAP[v] || 'public';
}

function generateField(field) {
  const vis = visibilityKeyword(field.visibility);
  const staticKw = field.isStatic ? 'static ' : '';
  const type = field.type || 'Object';
  const name = field.name || 'field';
  const prefix = vis ? `${vis} ` : '';
  return `    ${prefix}${staticKw}${type} ${name};`;
}

function generateMethod(method, isInterface, isAbstractClass) {
  const vis = visibilityKeyword(method.visibility);
  const staticKw = method.isStatic ? 'static ' : '';
  const abstractKw = (method.isAbstract && !isInterface && !method.isStatic) ? 'abstract ' : '';
  const returnType = method.returnType || 'void';
  const name = method.name || 'method';
  const params = method.params || '';
  const prefix = vis ? `${vis} ` : '';

  if (isInterface || (method.isAbstract && !method.isStatic)) {
    return `    ${prefix}${abstractKw}${returnType} ${name}(${params});`;
  }
  return `    ${prefix}${staticKw}${returnType} ${name}(${params}) {\n        // TODO: implement\n    }`;
}

function generateConstructor(cls) {
  if (cls.stereotype === '<<interface>>' || cls.stereotype === '<<enum>>') return '';
  const fields = cls.fields.filter(f => !f.isStatic && f.name && f.type);
  if (fields.length === 0) return '';

  const params = fields.map(f => `${f.type} ${f.name}`).join(', ');
  const assignments = fields.map(f => `        this.${f.name} = ${f.name};`).join('\n');

  return `\n    public ${cls.name}(${params}) {\n${assignments}\n    }`;
}

export function generateJavaCode(cls, relationships, allClasses) {
  const isInterface = cls.stereotype === '<<interface>>';
  const isAbstract = cls.stereotype === '<<abstract>>';
  const isEnum = cls.stereotype === '<<enum>>';

  // Determine extends / implements
  const extendsRels = relationships.filter(r => r.sourceId === cls.id && r.type === 'inheritance');
  const implementsRels = relationships.filter(r => r.sourceId === cls.id && r.type === 'implementation');

  const findClass = (id) => allClasses.find(c => c.id === id);

  const extendsClasses = extendsRels.map(r => findClass(r.targetId)?.name).filter(Boolean);
  const implementsInterfaces = implementsRels.map(r => findClass(r.targetId)?.name).filter(Boolean);

  let classKeyword = 'class';
  if (isInterface) classKeyword = 'interface';
  else if (isEnum) classKeyword = 'enum';

  const abstractKw = isAbstract && !isInterface ? 'abstract ' : '';
  const extendsStr = extendsClasses.length ? ` extends ${extendsClasses[0]}` : '';

  let implementsStr = '';
  if (!isInterface && implementsInterfaces.length) {
    implementsStr = ` implements ${implementsInterfaces.join(', ')}`;
  } else if (isInterface && extendsClasses.length) {
    // interfaces extend other interfaces
    implementsStr = ` extends ${extendsClasses.join(', ')}`;
  }

  const lines = [];

  // Class declaration
  lines.push(`public ${abstractKw}${classKeyword} ${cls.name}${extendsStr}${implementsStr} {`);
  lines.push('');

  if (isEnum) {
    // Enum values from fields
    const enumVals = cls.fields.map(f => f.name.toUpperCase()).join(', ');
    lines.push(`    ${enumVals || 'VALUE1, VALUE2'};`);
    lines.push('');
  } else {
    // Fields
    if (cls.fields.length > 0) {
      cls.fields.forEach(f => lines.push(generateField(f)));
      lines.push('');
    }

    // Constructor
    if (!isInterface) {
      const ctor = generateConstructor(cls);
      if (ctor) {
        lines.push(ctor);
        lines.push('');
      }
    }
  }

  // Methods
  if (cls.methods.length > 0) {
    cls.methods.forEach(m => lines.push(generateMethod(m, isInterface, isAbstract)));
    lines.push('');
  }

  lines.push('}');

  return lines.join('\n');
}

export function generateAllCode(classes, relationships) {
  return classes.map(cls => ({
    name: cls.name,
    code: generateJavaCode(cls, relationships, classes),
  }));
}
