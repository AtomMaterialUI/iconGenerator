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

import { ExamplesFlags } from '../argsParsers/examplesArgsParser';
import { WikiAllowedOutputs } from '../argsParsers/wikiArgsParser';
import { PreviewAllowedOutputs } from '../argsParsers/previewArgsParser';
import { KotlinAllowedOutputs } from '../argsParsers/kotlinArgsParser';

export interface Association {
  name: string;
  pattern: string;
  icon: string;
}

export interface IconAssociation extends Association {
  fileNames: string;
}

export interface FolderAssociation extends Association {
  folderNames: string;
}

export interface IconAssociations {
  [name: string]: IconAssociation;
}

export interface FolderAssociations {
  [name: string]: FolderAssociation;
}

export interface CommandArgs {
  force?: boolean;
  command: ExamplesFlags;
  account: string;
  output: WikiAllowedOutputs | PreviewAllowedOutputs | KotlinAllowedOutputs;
  token: string;
}
