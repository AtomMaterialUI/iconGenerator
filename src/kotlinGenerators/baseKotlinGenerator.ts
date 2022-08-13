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

import { WikiAllowedOutputs } from '../argsParsers/wikiArgsParser';
import { ISpinner, Logger } from '../services/logger';
import { pathUnixJoin, ROOT } from '../utils';
import { GitClient } from '../services/gitClient';
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import { KotlinCommandArgs } from '../argsParsers/kotlinArgsParser';

export interface KotlinGeneratorParams {
  pargs: KotlinCommandArgs,
  logger: Logger,
  gitClient: GitClient<KotlinCommandArgs>,
  logGroupId?: string,
  outputFile: string,
  associationsFile: string,
}

export abstract class BaseKotlinGenerator {
  protected gitClient: GitClient<KotlinCommandArgs>;
  protected logger: Logger;
  protected pargs: KotlinCommandArgs;
  protected logGroupId: string;

  /**
   * The url to the wiki page
   */
  protected WIKI_URL: string;
  protected wikiPageName: string;
  /**
   * The output file
   */
  protected outputFile: string;
  /**
   * The associations file
   */
  protected associationsFile: string;

  protected constructor(params: KotlinGeneratorParams) {
    this.gitClient = params.gitClient;
    this.logger = params.logger;
    this.pargs = params.pargs;
    this.logGroupId = params.logGroupId;

    this.outputFile = params.outputFile;
    this.associationsFile = params.associationsFile;
    this.WIKI_URL = `https://raw.githubusercontent.com/wiki/${this.pargs.account}/${ROOT}`;
    this.wikiPageName = 'IconAssociationsTemplate.kt.md';
  }

  /**
   * Generate the markdown page
   */
  async generate(): Promise<{ filename: string, content: string }> {
    // Create the list markdown
    const createdList = this.createList();
    // First retrieve the kotlin template
    const kotlinTemplate = await this.getKotlinTemplate();

    // Create a new kotlin file with the contents
    const newKtFile = this.createNewKtFile(kotlinTemplate, createdList);
    // Write the kotlin file
    this.tryWriteContentFile(newKtFile);

    return {
      filename: this.outputFile,
      content: newKtFile,
    };
  }

  /**
   * Inserts a new line at the end
   * @param list
   * @param index
   */
  protected getLineEnd(list: any[], index: number): string {
    return index === list.length - 1 ? '|\n' : '';
  }

  /**
   * Url to images folder
   */
  protected abstract getImagesUrl();

  /**
   * Generate the list of associations in markdown
   */
  protected abstract createList(): string;

  /**
   * Fetch the wiki page
   */
  private async getKotlinTemplate(): Promise<string> {
    return new Promise((resolve, reject) => {
      // If writing directly to the repo
      if (this.pargs.output === WikiAllowedOutputs.REPO) {
        try {
          // Fetch the file from wiki
          const filePath = pathUnixJoin(this.gitClient.wikiRepoFolder, this.wikiPageName);
          this.logger.log(`Reading wiki page from: ${filePath.replace(`${this.gitClient.rootFolder}`, '')}`,
            this.logGroupId);

          const src = fs.readFileSync(filePath).toString();
          return resolve(src);
        }
        catch (e) {
          this.logger.error(e);
          return reject(e);
        }
      }

      // Fetch wiki page from the repository
      const uri = `${this.WIKI_URL}/${this.wikiPageName}`;
      const spinner: ISpinner = this.logger.spinnerLogStart(`Requesting wiki page from: ${uri}`, this.logGroupId);

      // Fetch the page
      https.get(uri, (resp: http.IncomingMessage) => {
        const body = [];

        resp.on('error', err => {
          clearInterval(spinner.timer);
          reject(err.stack);
        });

        resp.on('data', chunk => {
          body.push(chunk);
        });

        resp.on('end', () => {
          this.logger.spinnerLogStop(spinner, 'Wiki page received', this.logGroupId);
          return resolve(Buffer.concat(body).toString());
        });

        if (resp.statusCode !== 200) {
          return reject(resp.statusMessage);
        }

      });
    });
  }

  /**
   * Create the new wiki page
   * @param content
   * @param createdList
   */
  private createNewKtFile(content: string, createdList: string) {
    try {
      this.logger.log('Starting new kotlin file creation', this.logGroupId);
      const newWikiPage = content.replace(/(\/\/ Placeholder)/gm, createdList);
      this.logger.log('New wiki page created', this.logGroupId);
      return newWikiPage;
    }
    catch (e) {
      throw new Error(`Failed creating new wiki page with reason: ${e}`);
    }
  }

  /**
   * Write the content to a file
   * @param content
   */
  private tryWriteContentFile(content: string) {
    if (!content) {
      return;
    }

    const dirname = this.pargs.output === WikiAllowedOutputs.REPO ? this.gitClient.wikiRepoFolder : __dirname;
    const filePath = pathUnixJoin(dirname, this.outputFile);
    const filePathLog = this.pargs.output === WikiAllowedOutputs.REPO ? filePath.replace(`${this.gitClient.rootFolder}`,
      '') : filePath;

    this.logger.log(`Writing new wiki page to: ${filePathLog}`, this.logGroupId);
    fs.writeFileSync(filePath, content);
  }

}
