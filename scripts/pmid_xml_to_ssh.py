#!/usr/bin/python

import os.path as op
import re
import sys
from optparse import OptionParser

def main():
    usage = """
    python pmid_xml_to_ssh.py YYYY_MM_DD.xml

    Parse the output of the esearch queries performed by pmids_by_date.py.
    and convert it to an output file called YYYY_MM_DD.ssv with a format like:

        YYYY/MM/DD pmid 
    """
    num_args= 0
    parser = OptionParser(usage=usage)

    #parser.add_option('-o', '--options', dest='some_option', default='yo', help="Place holder for a real option", type='str')
    #parser.add_option('-u', '--useless', dest='uselesss', default=False, action='store_true', help='Another useless option')

    (options, args) = parser.parse_args()

    if len(args) < num_args:
        parser.print_help()
        sys.exit(1)

    for arg in args:
        filename, ext = op.splitext(arg)
        filedate = op.split(filename)[1]
        new_filename = filename + ".ssv"

        with open(arg) as fin:
            with open(new_filename, 'w') as fout:
                text = fin.read()
                all_pmids = re.finditer(r"<Id>(?P<pmid>[0-9]+)</Id>", text)
                out_str = ""
                for pmid_match in all_pmids:
                    out_str += filedate.replace('_','/') + " " + pmid_match.group('pmid') + "\n"

                fout.write(out_str)

        print new_filename

if __name__ == '__main__':
    main()

