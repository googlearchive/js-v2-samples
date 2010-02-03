using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;

namespace SignUrl {

    public struct GoogleSignedUrl {

        public static Uri Sign(Uri url) {
            ASCIIEncoding encoding = new ASCIIEncoding();

            // key provided by Google
            const string PRIVATE_KEY = "YOUR_PRIVATE_KEY";

            // converting key to bytes will throw an exception, need to replace '-' and '_' characters first.
            string usablePrivateKey = PRIVATE_KEY.Replace("-", "+").Replace("_", "/");
            byte[] privateKeyBytes = Convert.FromBase64String(usablePrivateKey);
            string encodedPathAndQuery = url.LocalPath + url.Query;

            // get the bytes of the encoded url
            byte[] encodedPathAndQueryBytes = encoding.GetBytes(encodedPathAndQuery);

            // compute the hash
            HMACSHA1 algorithm = new HMACSHA1(privateKeyBytes);
            byte[] hash = algorithm.ComputeHash(encodedPathAndQueryBytes);

            // convert the bytes to string and make url-safe by replacing '+' and '/' characters
            string signature = Convert.ToBase64String(hash).Replace("+", "-").Replace("/", "_");
            
             // Add the signature to the existing URI.
            UriBuilder new_uri = new UriBuilder(url);
            if (String.IsNullOrEmpty(new_uri.Query)) {
                new_uri.Query = "signature=" + signature;
            } else {
                // Note: (MS Bug) The Query property returns the query string
                // with the starting '?' but expect to be set without.
                new_uri.Query = new_uri.Query.TrimStart(new char[] {'?'}) + "&signature=" + signature;
            }

            return new_uri.Uri;    
        }
    }

    class Program {

        static void Main(string[] args) {
        
          Uri url = new Uri("YOUR_URL_TO_SIGN");;
          // Convert the string into a URL.
          if (args.Length > 0) {
            url = new Uri(args[0]);
          }

           try {

                // Create a new URL with the signature added.
                Uri new_url = GoogleSignedUrl.Sign(url);

                // Outputs the URL as a string.
                // Note: (MS Bug) The 'toString()' method returns the Uri unescaped.
                // AbsoluteUri and OriginalUri return the unescaped string.
                Console.WriteLine(new_url.OriginalString);
            } catch (Exception ex) {
                Console.WriteLine(ex.Message);
            }
        }
    }
}
