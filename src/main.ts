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

import { Logger } from './services/logger';
import { ExamplesArgsParser } from './argsParsers/examplesArgsParser';
import { ExampleGenerator } from './exampleGenerator';
import { findDirectorySync, findFileSync } from './utils';
import { WikiArgsParser, WikiCommandArgs } from './argsParsers/wikiArgsParser';
import { GitClient } from './services/gitClient';
import { WikiGenerator } from './wikiGenerator';
import { PreviewArgsParser, PreviewCommandArgs } from './argsParsers/previewArgsParser';
import { PreviewGenerator } from './previewGenerator';
import { CommandArgs } from './types/associations';
import { KotlinArgsParser, KotlinCommandArgs } from './argsParsers/kotlinArgsParser';
import { KotlinGenerator } from './kotlinGenerator';

const generator = <ICommandArgs extends CommandArgs>(ArgsParser, Generator, useGit = false) => {
  return async () => {
    const logger = new Logger();
    // Parse arguments
    const pargs = new ArgsParser(logger).parse();

    const gitClient = useGit ? new GitClient<ICommandArgs>(pargs, logger) : null;

    // Find the icon association files root folder
    const rootDir = findDirectorySync('.');

    // Regexp to find the associations.json
    const baseRegex = '(?:(?:\\/|\\\\)[a-zA-Z0-9\\s_@\-^!#$%&+={}\\[\\]]+)*(?:\\/|\\\\)';
    // Find associations in src
    const filesPath = findFileSync(new RegExp(`${baseRegex}icon_associations\\.json`), rootDir)[0];
    const foldersPath = findFileSync(new RegExp(`${baseRegex}folder_associations\\.json`), rootDir)[0];

    if (useGit) {
      // Clone or open repo
      await Promise.all([
        gitClient.getCodeRepository(),
        gitClient.getWikiRepository(),
        gitClient.getDocsRepository(),
      ]);
    }

    try {
      // Try to parse the json files
      const files = require(filesPath).associations.associations.regex;
      const folders = require(foldersPath).associations.associations.regex;

      // Generate the files
      await new Generator(pargs, files, folders, logger, gitClient).generate();
      process.exit(0);
    }
    finally {
      process.exit(1);
    }
  };
};

export const examples = generator<CommandArgs>(ExamplesArgsParser, ExampleGenerator);

export const wiki = generator<WikiCommandArgs>(WikiArgsParser, WikiGenerator, true);

export const preview = generator<PreviewCommandArgs>(PreviewArgsParser, PreviewGenerator, true);

export const kotlin = generator<KotlinCommandArgs>(KotlinArgsParser, KotlinGenerator, false);
