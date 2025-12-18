/**
 * Codemod to wrap string const values starting with "/assets"
 * with withBasePath() helper.
 *
 * Example:
 *   const logo = '/assets/images/auth/logo.png';
 * ⬇️
 *   import { withBasePath } from 'utils/path';
 *   const logo = withBasePath('/assets/images/auth/logo.png');
 */

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let shouldAddImport = false;

  // Find all const declarations
  root.find(j.VariableDeclarator).forEach((path) => {
    const init = path.node.init;

    if (
      init &&
      ((init.type === 'Literal' && typeof init.value === 'string') || (init.type === 'StringLiteral' && typeof init.value === 'string')) &&
      init.value.startsWith('/assets')
    ) {
      path.node.init = j.callExpression(j.identifier('withBasePath'), [j.literal(init.value)]);
      shouldAddImport = true;
    }
  });

  // Insert import if not exists
  if (shouldAddImport) {
    const hasImport = root
      .find(j.ImportDeclaration, {
        source: { value: 'utils/path' }
      })
      .size();

    if (!hasImport) {
      const importDecl = j.importDeclaration([j.importSpecifier(j.identifier('withBasePath'))], j.literal('utils/path'));

      // taruh setelah semua import
      const body = root.get().node.program.body;
      let insertIndex = 0;
      while (body[insertIndex] && body[insertIndex].type === 'ImportDeclaration') {
        insertIndex++;
      }
      body.splice(insertIndex, 0, importDecl);
    }
  }

  return root.toSource({ quote: 'single' });
}

// ✅ pakai TSX parser
export const parser = 'tsx';
