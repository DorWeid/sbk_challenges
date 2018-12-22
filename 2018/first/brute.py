import zipfile
import sys


def main():
	"""
	Zipfile password cracker using a brute-force dictionary attack
	"""
	zipfilename = 'clues.zip'

	password = None
	zip_file = zipfile.ZipFile(zipfilename)
	for line in range(200000, 300000):
		try:
			print 'Trying: %s' % line
			zip_file.extractall(pwd=bytes(line))
			password = 'Password found: %s' % line
			print password
			return
		except:
			pass
	print password

if __name__ == '__main__':
	main()
