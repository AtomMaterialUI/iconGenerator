/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015-2022 Elior "Mallowigi" Boukhobza
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 */

import { FolderAssociation } from '../types/associations';
import { ROOT } from '../utils';
import { BaseKotlinGenerator, KotlinGeneratorParams } from '../kotlinGenerators/baseKotlinGenerator';

export interface FoldersKotlinGeneratorParams extends KotlinGeneratorParams {
  folders: FolderAssociation[],
}

export class FoldersKotlinGenerator extends BaseKotlinGenerator {
  private readonly folders: FolderAssociation[];

  constructor(params: FoldersKotlinGeneratorParams) {
    super({
      outputFile: 'FolderIconAssociations.kt',
      logGroupId: 'folders',
      associationsFile: 'folder_icon_associations.json',
      pargs: params.pargs,
      logger: params.logger,
      gitClient: params.gitClient,
    });
    this.folders = params.folders;
  }

  protected getImagesUrl() {
    return `https://raw.githubusercontent.com/${this.pargs.account}/${ROOT}/master/assets`;
  }

  protected createList(): string {
    let mdText = 'object FolderIconAssociations {\n';
    mdText += '  public val icons = mapOf<String, Icon>(\n';
    this.logger.log('Starting creating folder icon associations', this.logGroupId);

    // Add lines
    this.folders.forEach(folderAssociation => {
      mdText += this.getLine(folderAssociation);
    });

    mdText += '  )\n';
    mdText += '}';

    this.logger.log('Finished creating folder associations', this.logGroupId);

    return mdText;
  }

  private getLine(folderAssociation: FolderAssociation) {
    let mdText = '';

    const iconName = folderAssociation.name.toUpperCase().replace(/[\s().-]/g, '_');
    mdText += `"${iconName}" to IconLoader.findIcon("${folderAssociation.icon}", IconAssociations.javaClass)!!,\n`;
    return mdText;
  }
}
