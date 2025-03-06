import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os

# Define file paths
fst_path = "FST_results_all_chromosomes_GBR_vs_GIH.csv"
t2d_path = "associationsss.tsv"

# Check if files exist
if not os.path.exists(fst_path):
    print(f"Error: FST file not found at {fst_path}")
    exit(1)
if not os.path.exists(t2d_path):
    print(f"Error: T2D file not found at {t2d_path}")
    exit(1)

# Load data
df_fst = pd.read_csv(fst_path, dtype={'CHROM': str})
df_t2d = pd.read_csv(t2d_path, sep='\t', dtype={'chromosome': str})

# Rename columns for consistency
df_t2d.rename(columns={'chromosome': 'CHROM', 'position': 'POS'}, inplace=True)

# Verify required columns
if 'CHROM' not in df_t2d.columns or 'POS' not in df_t2d.columns:
    print("Error: T2D DataFrame missing 'CHROM' or 'POS' after renaming")
    exit(1)
if 'CHROM' not in df_fst.columns or 'POS' not in df_fst.columns:
    print("Error: FST DataFrame missing 'CHROM' or 'POS'")
    exit(1)

# Merge DataFrames on 'CHROM' and 'POS'
df_merged = pd.merge(df_t2d, df_fst, on=['CHROM', 'POS'], how='inner')

# Display first 10 rows
print("First 10 rows of merged T2D SNPs with FST values:")
print(df_merged.head(10))

# Summary statistics
print("\nSummary statistics for FST values of T2D SNPs:")
print(df_merged['FST'].describe())

# Total number of T2D SNPs
total_t2d_snps = df_merged.shape[0]
print(f"\nTotal number of T2D SNPs: {total_t2d_snps}")

# Calculate key statistics
mean_fst = df_merged['FST'].mean()    
median_fst = df_merged['FST'].median() 
max_fst = df_merged['FST'].max()      

# Identify and display the outlier SNP
print("\nDetails of the SNP with maximum FST:")
max_fst_row = df_merged.loc[df_merged['FST'].idxmax()]
print(max_fst_row[['CHROM', 'POS', 'FST']])

# Plot histogram
plt.figure(figsize=(10, 6))
n, bins, patches = plt.hist(df_merged['FST'], bins=10, range=(0, 0.25), 
                           color='skyblue', edgecolor='black', alpha=0.7)

# Highlight the bar containing the maximum FST (outlier SNP)
bin_index = np.digitize(max_fst, bins) - 1
if 0 <= bin_index < len(patches):
    patches[bin_index].set_facecolor('red')


# Add vertical lines for key statistics
plt.axvline(x=mean_fst, color='green', linestyle='--', 
            label=f'Mean FST: {mean_fst:.4f}')
plt.axvline(x=median_fst, color='purple', linestyle='--', 
            label=f'Median FST: {median_fst:.4f}')
plt.axvline(x=max_fst, color='red', linestyle='--', 
            label=f'Max FST: {max_fst:.4f}')

# Overlay density curve
sns.kdeplot(df_merged['FST'], color='blue', lw=2)

# Trim x-axis
plt.xlim(0, 0.25)

# Labels and title
plt.xlabel("FST")
plt.ylabel("Number of T2D SNPs")
plt.title("Histogram of FST Values for T2D SNPs (GBR vs GIH)")

# Add legend
plt.legend()

# Display plot
plt.show()

# Save merged DataFrame
output_path = "t2d_snps_with_fst_GIHvsGBR.csv"
df_merged.to_csv(output_path, index=False)
print(f"\nMerged T2D SNPs with FST saved to {output_path}")
