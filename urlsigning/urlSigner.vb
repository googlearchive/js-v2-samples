'Based on C# example code available here:
'http://googlemaps.github.io/js-v2-samples/urlsigning/UrlSigner.cs
'Converted to VB.NET by Danny Moules

'Licensed under Creative Commons Attribution-Share Alike 2.0 UK: England & Wales
'(http://creativecommons.org/licenses/by-sa/2.0/uk/)

Option Explicit On
Option Strict On

Imports System
Imports System.Security.Cryptography
Imports System.Text

Namespace SignUrl
    Public Module GoogleUrlSigner
        Public Function Sign(ByVal url As String, ByVal keyString As String) As String
            Dim encoding As ASCIIEncoding = New ASCIIEncoding()

            'URL-safe decoding
            Dim privateKeyBytes As Byte() = Convert.FromBase64String(keyString.Replace("-", "+").Replace("_", "/"))

            Dim objURI As Uri = New Uri(url)
            Dim encodedPathAndQueryBytes As Byte() = encoding.GetBytes(objURI.LocalPath & objURI.Query)

            'compute the hash
            Dim algorithm As HMACSHA1 = New HMACSHA1(privateKeyBytes)
            Dim hash As Byte() = algorithm.ComputeHash(encodedPathAndQueryBytes)

            'convert the bytes to string and make url-safe by replacing '+' and '/' characters
            Dim signature As String = Convert.ToBase64String(hash).Replace("+", "-").Replace("/", "_")

            'Add the signature to the existing URI.
            Return objURI.Scheme & "://" & objURI.Host & objURI.LocalPath & objURI.Query & "&signature=" & signature
        End Function
    End Module

    Public Module Program
        Sub Main()
            Const keyString As String = "vNIXE0xscrmjlyV-12Nj_BvUPaw="

            'The URL shown here is a static URL which should be already
            'URL-encoded. In practice, you will likely have code
            'which assembles your URL from user or web service input
            'and plugs those values into its parameters.
            Dim urlString As String = "http://maps.google.com/maps/api/geocode/json?address=New+York&sensor=false&client=clientID"

            Console.WriteLine(GoogleUrlSigner.Sign(urlString, keyString))
        End Sub
    End Module
End Namespace