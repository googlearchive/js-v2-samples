using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;

namespace SignUrl
{
    public struct GoogleSignedUrl
    {
        public static string Create(Uri url)
        {
            ASCIIEncoding encoding = new ASCIIEncoding();

            // key provided by Google
            const string PRIVATE_KEY = "YOUR_PRIVATE_KEY";

            // converting key to bytes will throw an exception, need to replace '-' and '_' characters first.
            string usablePrivateKey = PRIVATE_KEY.Replace("-", "+").Replace("_", "/");
            byte[] privateKeyBytes = Convert.FromBase64String(usablePrivateKey);
            string encodedPathAndQuery = url.LocalPath + url.Query;

            // get the bytes of the encoded url
            byte[] encodedPathAndQueryBytes = encoding.GetBytes(url.LocalPath + url.Query);

            // compute the hash
            HMACSHA1 algorithm = new HMACSHA1(privateKeyBytes);
            byte[] hash = algorithm.ComputeHash(encodedPathAndQueryBytes);

            // convert the bytes to string and make url-safe by replacing '+' and '/' characters
            string signature = Convert.ToBase64String(hash).Replace("+", "-").Replace("/", "_");

            // return the reassembled the url
            return url.Scheme + "://" + url.Host + encodedPathAndQuery + "&signature=" + signature;
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine(GoogleSignedUrl.Create(new Uri(args[0])));
        }
    }
}