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
import { PreviewArgsParser } from './argsParsers/previewArgsParser';
import { PreviewGenerator } from './previewGenerator';
import { KotlinArgsParser } from './argsParsers/kotlinArgsParser';
import { KotlinGenerator } from './kotlinGenerator';

const generator = (ArgsParser: any, Generator: any) => async () => {
  const logger = new Logger();
  // Parse arguments
  const pargs = new ArgsParser(logger).parse();

  // Find the icon association files root folder
  const rootDir = findDirectorySync('.');

  // Regexp to find the associations.json
  // language=RegExp
  const baseRegex = '(?:(?:\\/|\\\\)[a-zA-Z0-9\\s_@\-^!#$%&+={}\\[\\]]+)*(?:\\/|\\\\)';
  // Find associations in src
  const filesPath = findFileSync(new RegExp(`${baseRegex}icon_associations\\.json`), rootDir)[0];
  const foldersPath = findFileSync(new RegExp(`${baseRegex}folder_associations\\.json`), rootDir)[0];

  try {
    // Try to parse the json fil§es
    const files = require(filesPath).associations.associations.regex;
    const folders = require(foldersPath).associations.associations.regex;

    // Generate the files
    await new Generator(pargs, files, folders, logger).generate();
    process.exit(0);
  }
  finally {
    process.exit(1);
  }
};

export const examples = generator(ExamplesArgsParser, ExampleGenerator);

export const preview = generator(PreviewArgsParser, PreviewGenerator);

export const kotlin = generator(KotlinArgsParser, KotlinGenerator);
