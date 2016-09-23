#!/usr/bin/python

import datetime as dt
import os.path as op
import sys
import urllib
from optparse import OptionParser

def main():
    usage = """
    python pmids_by_date.py 
    """
    num_args= 0
    parser = OptionParser(usage=usage)

    #parser.add_option('-o', '--options', dest='some_option', default='yo', help="Place holder for a real option", type='str')
    #parser.add_option('-u', '--useless', dest='uselesss', default=False, action='store_true', help='Another useless option')
    parser.add_option('-s', '--startdate', dest='start_date', default='2014/01/01', help='The lower end of the date range to search (YYYY/MM/DD)', type='str')
    parser.add_option('-e', '--enddate', dest='end_date', default='2014/01/01', help='The upper range of the date range to search (YYYY/MM/DD)', type='str')
    parser.add_options('-o', '--output-dir', dest=output_dir, default='./data/pmid_by_date', helpt='The directory to dump all the files')

    (options, args) = parser.parse_args()

    start_date = dt.datetime.strptime(options.start_date, '%Y/%m/%d')
    end_date = dt.datetime.strptime(options.end_date, '%Y/%m/%d')

    if len(args) < num_args:
        parser.print_help()
        sys.exit(1)

    curr_date = start_date
    while (curr_date <= end_date):
        curr_date_str = dt.datetime.strftime(curr_date, '%Y/%m/%d')
        curr_date += dt.timedelta(days=1)

        output_file = op.join(args.output_dir,
                              "{}.xml".format(dt.datetime.strftime(curr_date, '%Y_%m_%d')))
        link = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&mindate={0}&maxdate={0}&retmax=100000".format(curr_date_str)
        f = urllib.urlopen(link)

        with open(output_file, 'w') as fout:
            fout.write(f.read())

        print output_file

if __name__ == '__main__':
    main()

