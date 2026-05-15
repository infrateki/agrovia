export function getLoteTemplate(): string {
  const headers = [
    'id',
    'parcela',
    'variedad',
    'calibre',
    'brix',
    'dryMatter',
    'fechaCosecha',
    'riskScore',
    'zone',
    'embarqueId',
  ];
  const rows = [
    'L-1001,Parcela Norte 3,arandano,12-14mm,11.8,0,2026-05-10,82,transito,S-8842',
    'L-2050,Parcela Sur 1,uva,18-20mm,16.5,0,2026-05-11,28,packing,',
  ];
  return [headers.join(','), ...rows].join('\n') + '\n';
}

export function getEmbarqueTemplate(): string {
  const headers = [
    'id',
    'contenedor',
    'naviera',
    'setPointTemp',
    'fechaZarpe',
    'eta',
    'clienteId',
    'loteIds',
    'status',
    'riskScore',
    'currentZone',
  ];
  const rows = [
    'S-8842,MSCU-7842190,MSC,-0.5,2026-05-08,2026-05-25,C-001,L-1001|L-1002,en-transito,91,transito',
    'S-8845,MSCU-9912045,Maersk,-0.8,2026-05-09,2026-05-23,C-002,L-1015|L-1016|L-1017,en-transito,22,transito',
  ];
  return [headers.join(','), ...rows].join('\n') + '\n';
}

export function getClienteTemplate(): string {
  const headers = [
    'id',
    'nombre',
    'pais',
    'segmento',
    'score',
    'preferencias',
    'totalReclamos',
    'totalEmbarques',
    'montoReclamosUsd',
  ];
  const rows = [
    'C-001,Walmart US,Estados Unidos,premium,82,calibre 14-16mm|brix>=11,4,128,154000',
    'C-002,Driscoll\'s,Estados Unidos,premium,91,empaque master 1.5kg,1,82,18000',
  ];
  return [headers.join(','), ...rows].join('\n') + '\n';
}

export function getTemperaturaTemplate(): string {
  const headers = ['id', 'embarqueId', 'timestamp', 'valor', 'sensorId', 'zona'];
  const rows = [
    'T-S8842-0001,S-8842,2026-05-08T00:00:00Z,-0.4,EMER-1,frio',
    'T-S8842-0002,S-8842,2026-05-08T00:30:00Z,-0.3,EMER-1,frio',
    'T-S8842-0168,S-8842,2026-05-12T12:00:00Z,5.8,EMER-1,transito',
  ];
  return [headers.join(','), ...rows].join('\n') + '\n';
}
