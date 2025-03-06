# Bio-727

APPLICATION FILES: 
https://qmulprod.sharepoint.com/:f:/s/ManticMinotaur/El9ULGsv7IRHnfJ0JvjXm88BcocC3n1HPdjT_juypAL7YQ?e=jEEgok


Goal: to produce a functioning prototype of a web-based software tool for handling molecular biology data.

## Features
- **Search Functionality:** Search by SNP ID, Gene Name, Chromosome Region, or Population.
- **SNP Details:** View chromosome location, allele frequency, and p-values.
- **Gene Annotations:** Explore gene functions and disease associations.
- **Selection Statistics:** Analyze population-level FST and iHS statistics.
- **Interactive Charts:** Visualize genomic data trends.
- **Download Data:** Export search results and summary statistics.

MSC BIOINFORMATICS
SOFTWARE DEVELOPMENT GROUP PROJECT 2025


Install Dependencies / Libraries / Requirements:
    Python 3.10+ 
    Node.js 
    SQLite 
    Flask 
    flask-cors
    Sqlite3
    Pandas
    JSON
    Requests
    gunicorn
    

Required files:
    associations.tsv
    uniprot_data.tsv 
    Populationdetails.tsv
    sub_population.tsv
    t2d_snps_with_fst_GIHvsGBR.csv
    ihs_summary_table_SA.tsv

Directory structure:
.
├── Populationdetails.tsv
├── README.txt
├── app.py
├── associations.tsv
├── genetics.db
├── genetics.db.py
├── ihs_summary_table_SA.tsv
├── static
│   ├── api.js
│   ├── charts.js
│   ├── main.js
│   ├── styles.css
│   └── ui.js
├── sub_population.tsv
├── t2d_snps_with_fst_GIHvsGBR.csv
├── templates
│   ├── gene.html
│   ├── index.html
│   ├── population.html
│   └── results.html
└── uniprot_data.tsv