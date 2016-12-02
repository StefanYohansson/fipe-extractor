#/usr/lib/perl
use strict;
use warnings;

use lib qw(..);

use JSON qw( );
use Data::Dumper;

my $filename = 'veiculos.json';

my $json_text = do {
    open(my $json_fh, "<:encoding(UTF-8)", $filename)
        or die("Can't open \$filename\": $!\n");
    local $/;
    <$json_fh>
};

my $json = JSON->new;
my $data = $json->decode($json_text);

foreach my $key (keys %$data)
{
    print "-- =======================================================================" . "\n";
    print "INSERT INTO marcas (id, nome) VALUES (" . $key . ", '" . $data->{$key}->{"name"} . "');" . "\n";

    foreach my $modelo (keys %{$data->{$key}->{"modelos"}})
    {
        print "INSERT INTO modelos (id, marca_id, nome) VALUES (" . $modelo . ", " . $key . ", '" . $data->{$key}->{"modelos"}->{$modelo}->{"name"} . "');" . "\n";

        foreach my $ano (keys %{$data->{$key}->{"modelos"}->{$modelo}->{"anos"}})
        {
            print "INSERT INTO anos (id, modelo_id, nome) VALUES ('" . $ano . "', " . $modelo . ", '" . $data->{$key}->{"modelos"}->{$modelo}->{"anos"}->{$ano} . "');" . "\n";
        }
    }
}
