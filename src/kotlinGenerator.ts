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

import { FolderAssociation, IconAssociation } from './types/associations';
import { Logger } from './services/logger';
import { GitClient } from './services/gitClient';
import { PreviewCommandArgs } from './argsParsers/previewArgsParser';
import { ExamplesFlags } from './argsParsers/examplesArgsParser';
import { FilesKotlinGenerator } from './kotlinGenerators/filesKotlinGenerator';
import { FoldersKotlinGenerator } from './kotlinGenerators/foldersKotlinGenerator';

export class KotlinGenerator {
  private filesKotlinGenerator: FilesKotlinGenerator;
  private foldersKotlinGenerator: FoldersKotlinGenerator;

  constructor(
    private pargs: PreviewCommandArgs,
    files: IconAssociation[],
    folders: FolderAssociation[],
    private logger: Logger,
    private gitClient: GitClient<PreviewCommandArgs>) {
    this.filesKotlinGenerator = new FilesKotlinGenerator({
      pargs,
      files,
      outputFile: '',
      associationsFile: '',
      logger,
      gitClient,
    });

    this.foldersKotlinGenerator = new FoldersKotlinGenerator({
      outputFile: '',
      associationsFile: '',
      pargs,
      folders,
      logger,
      gitClient,
    });

  }

  async generate() {
    const results = [];
    this.logger.log(`Running generate command for ${this.pargs.command}`, 'kotlin');
    switch (this.pargs.command) {
      case ExamplesFlags.ALL:
        results.push(await this.filesKotlinGenerator.generate());
        results.push(await this.foldersKotlinGenerator.generate());
        break;
      case ExamplesFlags.FILES:
        results.push(await this.filesKotlinGenerator.generate());
        break;
      case ExamplesFlags.FOLDERS:
        results.push(await this.foldersKotlinGenerator.generate());
        break;
    }

    try {
      if (this.gitClient) {
        await this.commitAndPushToWiki(results);
      }

      this.logger.log('Finished');
    }
    catch (e) {
      const error = e instanceof Error ? e : new Error(e);
      this.logger.error(error.stack);
      process.exit(1);
    }
  }

  private async commitAndPushToWiki(results: any[]) {
    let hasCommit: boolean;
    if (results && results.length) {
      for (const result of results) {
        hasCommit = await this.gitClient.tryCommitToWikiRepo(result.filename, result.content) || hasCommit;
      }
    }

    if (hasCommit) {
      await this.gitClient.tryPushToWikiRepo(results.length);
    }
  }

}
